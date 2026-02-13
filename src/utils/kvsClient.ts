import { SignalingClient, Role } from "amazon-kinesis-video-streams-webrtc";
import { KinesisVideoClient, DescribeSignalingChannelCommand, GetSignalingChannelEndpointCommand } from "@aws-sdk/client-kinesis-video";
import { KinesisVideoSignalingClient, GetIceServerConfigCommand } from "@aws-sdk/client-kinesis-video-signaling";
import {UserCredentials} from "@/models/User.ts";

interface ViewerHandle {
    signalingClient: SignalingClient;
    peerConnection: RTCPeerConnection;
}

export async function startViewer(
    videoElement: HTMLVideoElement,
    credentials: UserCredentials,
    region: string,
    channelName: string
): Promise<ViewerHandle> {

    const kvsClient = new KinesisVideoClient({
        region: region,
        credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken
        }
    });

    const describeCmd = new DescribeSignalingChannelCommand({ ChannelName: channelName });
    const describeResp = await kvsClient.send(describeCmd);
    const channelArn = describeResp.ChannelInfo?.ChannelARN;

    if (!channelArn) {
        throw new Error(`Channel ARN not found for channel: ${channelName}`);
    }

    const getEndpointsCmd = new GetSignalingChannelEndpointCommand({
        ChannelARN: channelArn,
        SingleMasterChannelEndpointConfiguration: {
            Protocols: ['WSS', 'HTTPS'],
            Role: Role.VIEWER
        }
    });
    const endpointsResp = await kvsClient.send(getEndpointsCmd);

    const endpoints = endpointsResp.ResourceEndpointList?.reduce((acc, endpoint) => {
        if (endpoint.Protocol && endpoint.ResourceEndpoint) {
            acc[endpoint.Protocol] = endpoint.ResourceEndpoint;
        }
        return acc;
    }, {} as Record<string, string>);

    if (!endpoints || !endpoints.WSS || !endpoints.HTTPS) {
        throw new Error("Failed to retrieve signaling endpoints");
    }

    const kvsSigClient = new KinesisVideoSignalingClient({
        region: region,
        credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken
        },
        endpoint: endpoints.HTTPS
    });

    const iceCmd = new GetIceServerConfigCommand({ ChannelARN: channelArn });
    const iceResp = await kvsSigClient.send(iceCmd);

    const iceServers: RTCIceServer[] = [
        { urls: `stun:stun.kinesisvideo.${region}.amazonaws.com:443` }
    ];

    iceResp.IceServerList?.forEach(server => {
        if (server.Uris && server.Username && server.Password) {
            iceServers.push({
                urls: server.Uris,
                username: server.Username,
                credential: server.Password
            });
        }
    });

    const peerConnection = new RTCPeerConnection({
        iceServers: iceServers,
        iceTransportPolicy: 'all'
    });

    const signalingClient = new SignalingClient({
        channelARN: channelArn,
        channelEndpoint: endpoints.WSS,
        clientId: `VIEWER_${Math.random().toString(36).substring(7)}`,
        role: Role.VIEWER,
        region: region,
        credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken
        },
        systemClockOffset: kvsClient.config.systemClockOffset
    });

    peerConnection.ontrack = (event) => {
        console.log("Track received:", event.streams[0]);
        if (videoElement.srcObject !== event.streams[0]) {
            videoElement.srcObject = event.streams[0];
        }
    };

    peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate) {
            signalingClient.sendIceCandidate(candidate);
        }
    };

    signalingClient.on('open', async () => {
        console.log("Signaling connected. Creating offer...");
        try {
            const offer = await peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });
            await peerConnection.setLocalDescription(offer);
            signalingClient.sendSdpOffer(peerConnection.localDescription as RTCSessionDescription);
        } catch (e) {
            console.error("Error creating offer:", e);
        }
    });

    signalingClient.on('sdpAnswer', async (answer) => {
        console.log("Received SDP Answer");
        try {
            await peerConnection.setRemoteDescription(answer);
        } catch (e) {
            console.error("Error setting remote description:", e);
        }
    });

    signalingClient.on('iceCandidate', (candidate) => {
        try {
            peerConnection.addIceCandidate(candidate);
        } catch (e) {
            console.error("Error adding ice candidate:", e);
        }
    });

    signalingClient.on('close', () => {
        console.log("Signaling client closed");
    });

    signalingClient.on('error', (error) => {
        console.error("Signaling client error:", error);
    });

    console.log("Starting Viewer...");
    signalingClient.open();

    return { signalingClient, peerConnection };
}