export interface Coords {
  lat: number;
  lng: number;
}
export interface Point {
  x: number;
  y: number;
}

export interface Area {
  points: Array<Point>;
}

export interface CreateOutpostBody {
  name: string;
  latitude: number;
  longitude: number;
  area: Area;
}

export interface CreateGroupBody {
  outpost_uuid: string;
  group_name: string;
}

export interface UpdateOutpostRequest {
  name?: string;
  area?: string;
}