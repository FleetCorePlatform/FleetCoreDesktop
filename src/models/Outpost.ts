interface GroupSummary {
    groupUUID: string,
    groupName: string,
    groupDroneCount: number
}

interface OutpostSummary {
    name: string
    latitude: number,
    longitude: number,
    createdAt: string,
    groups: Array<GroupSummary>,
    area?: {
        points: Array<{ x: number; y: number }>;
    };
}

export type {OutpostSummary, GroupSummary};