import {PointCoords} from "@/screens/Mission/types.ts";
import L from "leaflet";

export function isPointInPolygon(point: { x: number; y: number }, polygon: { x: number; y: number }[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        const intersect = ((yi > point.y) !== (yj > point.y)) &&
            (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

export function estimateMissionTime(waypoints: Array<PointCoords>, speedMs: number): string {
    if (waypoints.length < 2) return '--';

    let totalMeters = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
        const a = waypoints[i];
        const b = waypoints[i + 1];
        const from = L.latLng(a.y, a.x);
        const to = L.latLng(b.y, b.x);
        totalMeters += from.distanceTo(to);
    }

    const seconds = totalMeters / speedMs;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return mins > 0 ? `~${mins}m ${secs}s` : `~${secs}s`;
}