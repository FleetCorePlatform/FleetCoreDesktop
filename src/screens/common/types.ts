export interface Mission {
    name: string;
    missionUuid: string;
    startTime: string;
    detectionCount: number;
}

export interface Check {
    name: string;
    status: "UP" | "DOWN";
    data?: any;
}

export interface Health {
    status: "UP" | "DOWN";
    checks: Array<Check>;
}

export interface GroupSummary {
    groupUUID: string,
    groupName: string,
    groupDroneCount: number
}

export interface OutpostSummary {
    name: string
    uuid: string,
    latitude: number,
    longitude: number,
    createdAt: string,
    groups: Array<GroupSummary>,
    area?: {
        points: Array<{ x: number; y: number }>;
    };
}

export interface Outpost {
    uuid: string;
    name: string;
    latitude: number;
    longitude: number;
    area?: {
        points: Array<{ x: number; y: number }>;
    };
    created_at: string;
}

export interface UserCredentials {
    accessKeyId: string,
    secretAccessKey: string,
    sessionToken: string
}