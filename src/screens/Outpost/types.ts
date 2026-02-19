export interface Coords {
    lat: number,
    lng: number
}
export interface Point {
    x: number,
    y: number
}

export interface Area {
    points: Array<Point>
}

export interface CreateOutpostBody {
    name: string,
    latitude: number,
    longitude: number,
    area: Area
}

export interface CreateGroupBody {
    outpost_uuid: string;
    group_name: string;
}

export const GROUP_NAME_REGEX = /^[a-zA-Z0-9:_-]{1,128}$/;
