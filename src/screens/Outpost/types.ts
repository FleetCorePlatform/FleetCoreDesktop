export interface Coords {
    lat: number,
    lng: number
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
