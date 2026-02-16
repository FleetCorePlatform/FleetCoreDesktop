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