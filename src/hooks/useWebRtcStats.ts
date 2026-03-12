import React, { useEffect, useRef, useState } from 'react';

interface DroneStats {
    latency: number;
    bitrate: number;
    packetLoss: number;
    jitter: number;
    fps: number;
}

interface PrevStats {
    bytesReceived: number;
    framesDecoded: number;
    timestamp: number;
}

interface ViewerHandle {
    peerConnection?: RTCPeerConnection;
}

const DEFAULT_STATS: DroneStats = { latency: 0, bitrate: 0, packetLoss: 0, jitter: 0, fps: 0 };

export function useWebRtcStats(
    streamActive: boolean,
    viewerHandleRef: React.RefObject<ViewerHandle | null>
) {
    const prevStatsRef = useRef<PrevStats>({ bytesReceived: 0, framesDecoded: 0, timestamp: 0 });
    const [stats, setStats] = useState<DroneStats>(DEFAULT_STATS);

    useEffect(() => {
        if (!streamActive || !viewerHandleRef.current) {
            setStats(DEFAULT_STATS);
            return;
        }

        const interval = setInterval(async () => {
            const pc = viewerHandleRef.current?.peerConnection;
            if (!pc) return;

            try {
                const statsReport = await pc.getStats();
                let latency = 0, bitrate = 0, packetLoss = 0, jitter = 0, fps = 0;

                statsReport.forEach((report) => {
                    if (report.type === 'inbound-rtp' && report.kind === 'video') {
                        const {
                            timestamp: now,
                            bytesReceived: bytes,
                            framesDecoded: frames = 0,
                        } = report;

                        if (prevStatsRef.current.timestamp > 0) {
                            const dt = (now - prevStatsRef.current.timestamp) / 1000;
                            if (dt > 0) {
                                bitrate = ((bytes - prevStatsRef.current.bytesReceived) * 8) / dt / 1_000_000;
                                fps = (frames - prevStatsRef.current.framesDecoded) / dt;
                            }
                        }

                        prevStatsRef.current = { bytesReceived: bytes, framesDecoded: frames, timestamp: now };
                        packetLoss = report.packetsLost || 0;
                        jitter = (report.jitter || 0) * 1000;
                    }

                    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                        latency = (report.currentRoundTripTime || 0) * 1000;
                    }
                });

                setStats({ latency, bitrate, packetLoss, jitter, fps });
            } catch (e) {
                console.error('Error fetching WebRTC stats:', e);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [streamActive]);

    return stats;
}