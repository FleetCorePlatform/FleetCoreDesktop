export interface Drone {
  uuid: string;
  name: string;
  group_uuid: string;
  address: string;
  manager_version: string;
  first_discovered: string;
  home_position: { x: number; y: number; z: number };
  model: string;
  capabilities: Array<string>;
  status: {
    uptime: number | null;
    connected: boolean;
  };
}

export interface TerminalEntry {
  type: 'command' | 'output' | 'error';
  content: string;
}

export enum PacketType {
  HANDSHAKE_REQ = "HANDSHAKE_REQ",
  HANDSHAKE_ACK = "HANDSHAKE_ACK",
  CONTROL = "CONTROL",
  CMD_REQ = "CMD_REQ",
  CMD_ACK = "CMD_ACK",
}

export enum ControlStatus {
  IDLE = "IDLE",
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
}

export enum ControlActions {
  TAKEOFF = "TAKEOFF",
  LAND = "LAND",
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

export interface CommandReqPayload {
  command: string;
  args: Array<string>;
}

export interface CommandAckPayload {
  status: number;
  result?: string;
}

export interface ManualControlState {
  pitch: number;
  roll: number;
  throttle: number;
  yaw: number;
}

export interface ManualControlActionState {
  action: ControlActions;
}

export interface ControlPacket {
  type: PacketType.CONTROL;
  sequenceId: number;
  payload: ManualControlState | ManualControlActionState;
}

export interface CommandReqPacket {
  type: PacketType.CMD_REQ;
  payload: CommandReqPayload;
}

export interface CommandAckPacket {
  type: PacketType.CMD_ACK;
  payload: CommandAckPayload;
}

export type DataChannelPacket = HandshakeReqPacket | HandshakeAckPacket | ControlPacket | CommandAckPacket | CommandReqPacket;

export type StreamState = 'idle' | 'pending' | 'active';
export type ControlScreenSelectedView = 'control' | 'info';
