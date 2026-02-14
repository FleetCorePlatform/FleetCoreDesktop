interface Mission {
    name: string;
    missionUuid: string;
    startTime: string;
    detectionCount: number;
}

interface MissionDetails {
    jobStatus: string;
    startedAt: string;
    finishedAt?: string;
}

export type {Mission, MissionDetails};