interface GroupSummary {
    groupUUID: string,
    groupName: string,
    groupDroneCount: number
}

interface OutpostSummary {
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

interface Point {
    x: number,
    y: number
}

interface Area {
    points: Array<Point>
}

interface CreateOutpostBody {
    name: string,
    latitude: number,
    longitude: number,
    area: Area
}

export type {OutpostSummary, GroupSummary, CreateOutpostBody};