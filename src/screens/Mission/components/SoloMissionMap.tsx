import {
    MapContainer,
    TileLayer,
    Polygon,
    useMapEvents,
    Polyline,
    Tooltip,
    Marker,
} from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button.tsx';
import { PanelLeft, Pencil, Trash2, Move } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import { BaseMapProps, PointCoords } from '@/screens/Mission/types.ts';
import { MapController } from '@/screens/Mission/components/MissionMap.tsx';
import { isPointInPolygon } from '@/screens/Mission/utils/common.ts';

type EditMode = 'draw' | 'edit' | 'delete' | null;

export function SoloMissionController({
        waypoints,
        setWaypoints,
        mode,
    }: {
        waypoints: Array<PointCoords>;
        setWaypoints: (pts: Array<PointCoords>) => void;
        mode: EditMode;
}) {
    useMapEvents({
        click(e) {
            if (mode !== 'draw') return;
            setWaypoints([...waypoints, { x: e.latlng.lng, y: e.latlng.lat }]);
        },
    });
    return null;
}

export interface SoloMissionMapProps extends BaseMapProps {
    soloWaypoints: Array<PointCoords>;
    setSoloWaypoints: (points: Array<PointCoords>) => void;
    returnToLaunch: boolean;
}

const makeDotIcon = (color: string) =>
    L.divIcon({
        className: '',
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5)"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    });

const drawIcon = makeDotIcon('#1E4AA6');
const editIcon = makeDotIcon('#f59e0b');
const deleteIcon = makeDotIcon('#ef4444');
const outsideIcon = makeDotIcon('#ef4444');

export function SoloMissionMap({
       outpost,
       theme,
       polygonPositions,
       sidebarOpen,
       setSidebarOpen,
       soloWaypoints,
       setSoloWaypoints,
       returnToLaunch,
   }: SoloMissionMapProps) {
    const [mode, setMode] = useState<EditMode>(null);

    const outpostPoints = outpost?.area?.points ?? [];

    const isOutside = (pt: PointCoords) => !isPointInPolygon(pt, outpostPoints);

    const getIcon = (pt: PointCoords) => {
        if (mode === 'delete') return deleteIcon;
        if (mode === 'edit') return isOutside(pt) ? outsideIcon : editIcon;
        return isOutside(pt) ? outsideIcon : drawIcon;
    };

    const toggleMode = (next: EditMode) => setMode((prev) => (prev === next ? null : next));

    const handleMarkerDrag = (idx: number, latlng: L.LatLng) => {
        const updated = soloWaypoints.map((pt, i) =>
            i === idx ? { x: latlng.lng, y: latlng.lat } : pt
        );
        setSoloWaypoints(updated);
    };

    const handleMarkerClick = (idx: number) => {
        if (mode !== 'delete') return;
        setSoloWaypoints(soloWaypoints.filter((_, i) => i !== idx));
    };

    return (
        <main className="flex-1 relative bg-[hsl(var(--bg-primary))]">
            <MapContainer
                center={[outpost.latitude, outpost.longitude]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
                zoomControl={false}
            >
                {theme === 'light' ? (
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&COPY OpenStreetMap"
                    />
                ) : (
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                    />
                )}

                <MapController points={polygonPositions} />
                <SoloMissionController waypoints={soloWaypoints} setWaypoints={setSoloWaypoints} mode={mode} />

                <Polygon
                    positions={polygonPositions}
                    pathOptions={{ color: '#658EAD', fill: false, weight: 3, dashArray: '5, 5' }}
                >
                    <Tooltip sticky>Geofence: Restricts drone mission to the designated outpost area.</Tooltip>
                </Polygon>

                {soloWaypoints.length > 0 && (
                    <>
                        <Polyline
                            positions={soloWaypoints.map((pt) => [pt.y, pt.x] as L.LatLngExpression)}
                            pathOptions={{ color: '#1e4aa6', weight: 3 }}
                        />
                        {soloWaypoints.map((pt, idx) => (
                            <Marker
                                key={idx}
                                position={[pt.y, pt.x]}
                                icon={getIcon(pt)}
                                draggable={mode === 'edit'}
                                eventHandlers={{
                                    dragend(e) {
                                        if (mode !== 'edit') return;
                                        handleMarkerDrag(idx, (e.target as L.Marker).getLatLng());
                                    },
                                    click() {
                                        handleMarkerClick(idx);
                                    },
                                }}
                            >
                                {isOutside(pt) ? (
                                    <Tooltip sticky>Waypoint outside outpost area</Tooltip>
                                ) : (
                                    <Tooltip sticky>
                                        {idx === 0
                                            ? `Waypoint ${idx + 1} — Takeoff · Lat: ${pt.y.toFixed(5)} Lon: ${pt.x.toFixed(5)}`
                                            : idx === soloWaypoints.length - 1
                                                ? returnToLaunch
                                                    ? `Waypoint ${idx + 1} — After: Return to home · Lat: ${pt.y.toFixed(5)} Lon: ${pt.x.toFixed(5)}`
                                                    : `Waypoint ${idx + 1} — After: Land Here · Lat: ${pt.y.toFixed(5)} Lon: ${pt.x.toFixed(5)}`
                                                : `Waypoint ${idx + 1} — Lat: ${pt.y.toFixed(5)} Lon: ${pt.x.toFixed(5)}`
                                        }
                                    </Tooltip>
                                )}
                            </Marker>
                        ))}
                    </>
                )}
            </MapContainer>

            {/* Toolbar */}
            <div className="lg:block absolute top-4 lg:left-5 left-14 z-[400] space-x-1">
                <Button
                    variant="secondary"
                    size="icon"
                    title="Draw waypoints"
                    onClick={() => toggleMode('draw')}
                    className={`shadow-xl border transition-colors ${
                        mode === 'draw'
                            ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700'
                            : 'bg-[hsl(var(--bg-primary))] border-[hsl(var(--border-primary))]'
                    }`}
                >
                    <Pencil size={16} />
                </Button>
                <Button
                    variant="secondary"
                    size="icon"
                    title="Drag waypoints"
                    onClick={() => toggleMode('edit')}
                    disabled={soloWaypoints.length === 0}
                    className={`shadow-xl border transition-colors ${
                        mode === 'edit'
                            ? 'bg-amber-500 border-amber-400 text-white hover:bg-amber-600'
                            : 'bg-[hsl(var(--bg-primary))] border-[hsl(var(--border-primary))]'
                    }`}
                >
                    <Move size={16} />
                </Button>
                <Button
                    variant="secondary"
                    size="icon"
                    title="Delete waypoints"
                    onClick={() => toggleMode('delete')}
                    disabled={soloWaypoints.length === 0}
                    className={`shadow-xl border transition-colors ${
                        mode === 'delete'
                            ? 'bg-red-600 border-red-500 text-white hover:bg-red-700'
                            : 'bg-[hsl(var(--bg-primary))] border-[hsl(var(--border-primary))]'
                    }`}
                >
                    <Trash2 size={16} />
                </Button>
            </div>

            <Button
                variant="secondary"
                size="icon"
                className={`absolute top-4 left-4 z-[1000] lg:hidden shadow-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] transition-opacity duration-300 ${
                    sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
                onClick={() => setSidebarOpen(true)}
            >
                <PanelLeft size={20} />
            </Button>

            <div className="hidden lg:block absolute top-6 right-6 z-[400] flex flex-col items-end gap-2 pointer-events-none">
                <div className="bg-[hsl(var(--bg-tertiary))]/95 backdrop-blur text-[hsl(var(--text-primary))] px-4 py-2 rounded-md border border-[hsl(var(--accent))]/30 shadow-xl">
                    <span className="text-[10px] uppercase tracking-widest text-[hsl(var(--accent))] block mb-0.5">
                        Mission Target
                    </span>
                    <span className="font-mono text-lg font-bold">{outpost.name}</span>
                </div>
            </div>
        </main>
    );
}