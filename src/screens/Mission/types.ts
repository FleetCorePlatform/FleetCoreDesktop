export interface MissionDetails {
  jobStatus: string;
  startedAt: string;
  finishedAt?: string;
}

export interface CreateMissionRequest {
  outpostUuid: string;
  groupUuid: string;
  altitude: number;
  jobName: string;
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
