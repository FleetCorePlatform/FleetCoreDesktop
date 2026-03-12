import { OutpostSummary } from '@/screens/common/types.ts';

export interface MissionDetails {
  jobStatus: string;
  startedAt: string;
  finishedAt?: string;
}


export interface CreateSoloMissionRequest {
  jobName: string,
  droneUuid: string,
  waypoints: Array<{x: number, y: number}>,
  altitude: number,
  speed?: number,
  returnToLaunch?: boolean,
}

export interface CreateGroupMissionRequest {
  jobName: string,
  outpostUuid: string,
  groupUuid: string,
  droneUuids?: Array<string>,
  altitude: number,
}

export enum MissionBodyEnum {
  CANCELLED,
}

export interface CancelMissionRequest {
  status: MissionBodyEnum;
}

export interface Detection {
  uuid: string;
  mission_uuid: string;
  detected_by_drone_uuid: string;
  object: string;
  confidence: number;
  false_positive: boolean;
  detected_at: string;
  location: { x: number; y: number };
  image_key: string;
}

export interface DetectionValidationRequest {
  false_positive: boolean;
}

export type FilterStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'FALSE_POSITIVE';
export type MissionType = 'FULL' | 'SUBSET' | 'SOLO';
export type PointCoords = { x: number; y: number };

export type ProgressState = 'calculating' | 'success' | 'error';

export interface BaseMapProps {
  outpost: OutpostSummary;
  theme: string;
  polygonPositions: L.LatLngExpression[];
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}