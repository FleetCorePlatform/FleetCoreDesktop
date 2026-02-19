import { encode, decode } from "cbor-js";

export enum PacketType {
  HANDSHAKE_REQ = "HANDSHAKE_REQ",
  HANDSHAKE_ACK = "HANDSHAKE_ACK",
  CONTROL = "CONTROL",
}

export enum ControlStatus {
  IDLE = "IDLE",
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
}

export interface HandshakeReqPacket {
  type: PacketType.HANDSHAKE_REQ;
  payload: {
    command: "START_MANUAL_CONTROL" | "STOP_MANUAL_CONTROL";
  };
}

export interface HandshakeAckPacket {
  type: PacketType.HANDSHAKE_ACK;
  payload: {
    status: "ACCEPTED" | "DENIED" | "STOPPED";
    reason?: string;
  };
}

export interface ManualControlState {
  pitch: number;
  roll: number;
  throttle: number;
  yaw: number;
  buttons: {
    land: boolean;
    takeoff: boolean;
  };
}

export interface ControlPacket {
  type: PacketType.CONTROL;
  sequenceId: number;
  payload: ManualControlState;
}

export type DataChannelPacket = HandshakeReqPacket | HandshakeAckPacket | ControlPacket;

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

export const setManualControlChannel = (channel: RTCDataChannel | null) => {
  activeDataChannel = channel;
  updateStatus(ControlStatus.IDLE);
  controlSequenceId = 0;

  if (activeDataChannel) {
    activeDataChannel.binaryType = "arraybuffer";
    activeDataChannel.onmessage = (event) => {
      try {
        const packet = decode(event.data as ArrayBuffer) as DataChannelPacket;
        processIncomingPacket(packet);
      } catch (e) {
        console.error("Failed to decode incoming packet", e);
      }
    };
  }
};

const processIncomingPacket = (packet: DataChannelPacket) => {
  if (packet.type === PacketType.HANDSHAKE_ACK) {
    if (packet.payload.status === "ACCEPTED") {
      console.log("[CONTROL] Handshake Accepted");
      updateStatus(ControlStatus.ACTIVE);
    } else {
      console.warn(`[CONTROL] Handshake Denied/Stopped: ${packet.payload.reason}`);
      updateStatus(ControlStatus.IDLE);
      controlSequenceId = 0;
    }
  }
};

export const requestManualControl = () => {
  if (!activeDataChannel || activeDataChannel.readyState !== "open") {
    console.error("Data channel not ready for handshake");
    return;
  }

  updateStatus(ControlStatus.PENDING);
  const req: HandshakeReqPacket = {
    type: PacketType.HANDSHAKE_REQ,
    payload: { command: "START_MANUAL_CONTROL" }
  };

  activeDataChannel.send(encode(req));
  console.log("[CONTROL] Handshake Requested");
};

export const releaseManualControl = () => {
  if (!activeDataChannel || activeDataChannel.readyState !== "open") return;

  const req: HandshakeReqPacket = {
    type: PacketType.HANDSHAKE_REQ,
    payload: { command: "STOP_MANUAL_CONTROL" }
  };

  activeDataChannel.send(encode(req));
  updateStatus(ControlStatus.IDLE);
  controlSequenceId = 0;
  console.log("[CONTROL] Handshake Released");
};

export const sendManualControl = (state: ManualControlState) => {
  if (currentStatus !== ControlStatus.ACTIVE || !activeDataChannel) return;

  const now = Date.now();
  if (now - lastSent < SEND_INTERVAL) return;
  lastSent = now;

  const packet: ControlPacket = {
    type: PacketType.CONTROL,
    sequenceId: ++controlSequenceId,
    payload: state,
  };

  try {
    activeDataChannel.send(encode(packet));
  } catch (e) {
    console.error("Failed to send control packet", e);
  }
};