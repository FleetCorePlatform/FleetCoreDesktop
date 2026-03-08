import { decode, encode } from 'cbor-js';
import {
  CommandReqPacket,
  CommandReqPayload,
  ControlPacket,
  ControlStatus,
  DataChannelPacket,
  HandshakeReqPacket,
  ManualControlActionState,
  ManualControlState,
  PacketType,
} from '@/screens/Drone/types.ts';

let currentStatus: ControlStatus = ControlStatus.IDLE;
let controlSequenceId = 0;
let lastSent = 0;
const SEND_INTERVAL = 50;

let activeDataChannel: RTCDataChannel | null = null;
let statusCallback: ((status: ControlStatus) => void) | null = null;

export const setControlStatusListener = (cb: (status: ControlStatus) => void) => {
  statusCallback = cb;
  cb(currentStatus);
};

const updateStatus = (newStatus: ControlStatus) => {
  currentStatus = newStatus;
  if (statusCallback) statusCallback(currentStatus);
};

let cmdResponseCallback: ((payload: any) => void) | null = null;

export const setCmdResponseListener = (cb: ((payload: any) => void) | null) => {
  cmdResponseCallback = cb;
};

export const setManualControlChannel = (channel: RTCDataChannel | null) => {
  if (activeDataChannel) {
    activeDataChannel.onmessage = null;
  }

  activeDataChannel = channel;
  updateStatus(ControlStatus.IDLE);
  controlSequenceId = 0;

  if (activeDataChannel) {
    activeDataChannel.binaryType = 'arraybuffer';
    activeDataChannel.onmessage = (event) => {
      try {
        const packet = decode(event.data as ArrayBuffer) as DataChannelPacket;
        processIncomingPacket(packet);
      } catch (e) {
        console.error('Failed to decode incoming packet', e);
      }
    };
  }
};

const processIncomingPacket = (packet: DataChannelPacket) => {
  if (packet.type === PacketType.HANDSHAKE_ACK) {
    if (packet.payload.status === 'ACCEPTED') {
      console.log('[CONTROL] Handshake Accepted');
      updateStatus(ControlStatus.ACTIVE);
    } else {
      console.warn(`[CONTROL] Handshake Denied/Stopped: ${packet.payload.reason}`);
      updateStatus(ControlStatus.IDLE);
      controlSequenceId = 0;
    }
  } else if (packet.type === PacketType.CMD_ACK) {
    console.log(`Received packet with type ${packet.type}, and content: ${packet.payload}`);
    if (cmdResponseCallback) {
      cmdResponseCallback(packet.payload);
    }
  }
};

export const requestManualControl = () => {
  if (!activeDataChannel || activeDataChannel.readyState !== 'open') {
    console.error('Data channel not ready for handshake');
    return;
  }

  updateStatus(ControlStatus.PENDING);
  const req: HandshakeReqPacket = {
    type: PacketType.HANDSHAKE_REQ,
    payload: { command: 'START_MANUAL_CONTROL' },
  };

  activeDataChannel.send(encode(req));
  console.log('[CONTROL] Handshake Requested');
};

export const releaseManualControl = () => {
  if (!activeDataChannel || activeDataChannel.readyState !== 'open') return;

  const req: HandshakeReqPacket = {
    type: PacketType.HANDSHAKE_REQ,
    payload: { command: 'STOP_MANUAL_CONTROL' },
  };

  activeDataChannel.send(encode(req));
  updateStatus(ControlStatus.IDLE);
  controlSequenceId = 0;
  console.log('[CONTROL] Handshake Released');
};

export function sendManualControl(payload: ManualControlState | ManualControlActionState) {
  if (currentStatus !== ControlStatus.ACTIVE || !activeDataChannel) return;

  const now = Date.now();
  if (now - lastSent < SEND_INTERVAL) return;
  lastSent = now;

  const packet: ControlPacket = {
    type: PacketType.CONTROL,
    sequenceId: ++controlSequenceId,
    payload: payload,
  };

  try {
    activeDataChannel.send(encode(packet));
  } catch (e) {
    console.error('Failed to send control packet', e);
  }
}

export function sendShellCommand(payload: CommandReqPayload) {
  if (!activeDataChannel) return;

  const packet: CommandReqPacket = {
    type: PacketType.CMD_REQ,
    payload: payload,
  };

  try {
    activeDataChannel.send(encode(packet));
  } catch (e) {
    console.error('Failed to send cmd packet', e);
  }
}
