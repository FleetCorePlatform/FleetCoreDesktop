import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import {
    PanelLeft,
    Activity,
    Satellite,
    Plane,
    Map as MapIcon
} from 'lucide-react';
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import "leaflet/dist/leaflet.css";

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { OutpostSummary } from "@/models/Outpost.ts";
import { useTheme } from "@/ThemeProvider.tsx";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface OutpostData {
    uuid: string;
    name: string;
    latitude: number;
    longitude: number;
    boundary: Array<{ x: number; y: number }>;
}

function MapController({ points }: { points: L.LatLngExpression[] }) {
    const map = useMap();
    useEffect(() => {
        if (points && points.length > 0) {
            const bounds = L.polygon(points).getBounds();
            map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
        }
    }, [points, map]);
    return null;
}

export default function MissionCreationScreen() {
    const { groupUuid } = useParams<{ groupUuid: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const outpostSummary: OutpostSummary = location.state?.groupData;
    const [outpost, setOutpost] = useState<OutpostData | null>(null);

    const [loading, setLoading] = useState(true);
    const [missionAltitude, setMissionAltitude] = useState([50]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!outpostSummary) {
                navigate('/outposts');
                return;
            }

            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 300));

            setOutpost({
                uuid: groupUuid || "",
                name: outpostSummary.name,
                latitude: outpostSummary.latitude,
                longitude: outpostSummary.longitude,
                boundary: outpostSummary.area?.points || []
            });
            setLoading(false);
        };
        fetchData();
    }, [groupUuid, outpostSummary, navigate]);

    const polygonPositions: L.LatLngExpression[] = useMemo(() => {
        if (!outpost?.boundary) return [];
        return outpost.boundary.map(p => [p.y, p.x] as [number, number]);
    }, [outpost]);

    const handleConfirmMission = async () => {
        if (!outpost) return;
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigate('/missions');
    };

    if (loading || !outpost) {
        return (
            <div className="flex h-screen items-center justify-center bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-secondary))] font-mono animate-pulse">
                <Activity className="animate-spin mr-2 h-5 w-5" />
                ACQUIRING TARGET DATA...
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            <div className="flex flex-1 relative overflow-hidden">

                {/* Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-[1400] lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar (Editor Panel) */}
                <aside className={`
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    fixed lg:relative
                    w-full sm:w-[340px]
                    flex flex-col bg-[hsl(var(--bg-secondary))] border-r border-[hsl(var(--border-primary))] 
                    z-[1500] lg:z-20 shadow-2xl
                    transition-transform duration-300 ease-in-out
                    h-full
                `}>
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-[hsl(var(--border-primary))]">
                        <div className="flex items-center gap-2 mb-1">
                            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}
                                    className="h-8 w-8 -ml-2 lg:hidder md:hidden text-[hsl(var(--text-secondary))]">
                                <PanelLeft size={20}/>
                            </Button>
                            <h1 className="text-lg font-bold">New Mission</h1>
                        </div>
                        <p className="text-xs text-[hsl(var(--text-secondary))] pl-7">Configure autonomous flight parameters</p>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-[#3b4354] scrollbar-track-transparent">

                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider flex items-center gap-2">
                                <MapIcon size={12} /> Target Zone
                            </h3>
                            <div className="space-y-2">
                                <Label className="text-xs">Outpost Designator</Label>
                                <Input
                                    value={outpost.name}
                                    disabled
                                    className="h-9 text-sm bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-muted))]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className="space-y-1.5">
                                    <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">Latitude</span>
                                    <Input
                                        value={outpost.latitude.toFixed(6)}
                                        disabled
                                        className="font-mono h-9 text-xs bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-muted))]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">Longitude</span>
                                    <Input
                                        value={outpost.longitude.toFixed(6)}
                                        disabled
                                        className="font-mono h-9 text-xs bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-muted))]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-[#282e39]"/>

                        {/* Section 2: Flight Parameters */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider flex items-center gap-2">
                                <Plane size={12} /> Flight Parameters
                            </h3>

                            <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-4 space-y-4">
                                <div className="flex justify-between items-end">
                                    <Label className="text-xs">Survey Altitude (AGL)</Label>
                                    <span className="font-mono text-sm font-bold text-emerald-400">{missionAltitude[0]}m</span>
                                </div>

                                <Slider
                                    defaultValue={[50]}
                                    max={120}
                                    min={20}
                                    step={5}
                                    value={missionAltitude}
                                    onValueChange={setMissionAltitude}
                                    className="py-2"
                                />

                                <div className="flex justify-between text-[10px] text-[hsl(var(--text-secondary))] font-mono uppercase">
                                    <span>High Res (20m)</span>
                                    <span>Fast Scan (120m)</span>
                                </div>
                            </div>

                            <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-xs text-[hsl(var(--text-secondary))]">
                                <p className="leading-relaxed">
                                    <strong>Note:</strong> Flight path will be auto-generated based on the defined boundary polygon.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-5 lg:pb-[5.3em] md:pb-[4.5em] pb-[4.5em] border-t border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-secondary))] space-y-2">
                        <Button
                            className="w-full h-9 text-sm bg-white text-black hover:bg-gray-200"
                            disabled={isSubmitting}
                            onClick={handleConfirmMission}
                        >
                            {isSubmitting ? (
                                <><Activity className="animate-spin mr-2 h-4 w-4" /> Initializing...</>
                            ) : (
                                <><Satellite className="mr-2 h-4 w-4" /> Confirm Mission</>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/outposts')}
                            className="w-full h-9 text-sm border-[hsl(var(--border-secondary))] hover:bg-[hsl(var(--bg-tertiary))]"
                        >
                            Cancel
                        </Button>
                    </div>
                </aside>

                <main className="flex-1 relative bg-[hsl(var(--bg-primary))]">
                    <MapContainer
                        center={[outpost.latitude, outpost.longitude]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                        className="z-0"
                        zoomControl={false}
                    >
                        {theme === "light" ? (
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

                        <Polygon
                            positions={polygonPositions}
                            pathOptions={{
                                color: '#3b82f6',
                                fillColor: '#3b82f6',
                                fillOpacity: 0.15,
                                weight: 2,
                                dashArray: '10, 5'
                            }}
                        />
                    </MapContainer>

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="secondary"
                        size="icon"
                        className={`absolute top-4 left-4 z-[1000] lg:hidden shadow-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] transition-opacity duration-300 ${
                            sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
                        }`}
                        onClick={() => setSidebarOpen(true)}
                    >
                        <PanelLeft size={20}/>
                    </Button>

                    {/* Desktop HUD Overlay */}
                    <div className="hidden lg:block absolute top-6 right-6 z-[400] flex flex-col items-end gap-2 pointer-events-none">
                        <div className="bg-[hsl(var(--bg-tertiary))]/95 backdrop-blur text-[hsl(var(--text-primary))] px-4 py-2 rounded-md border border-[hsl(var(--accent))]/30 shadow-xl">
                            <span className="text-[10px] uppercase tracking-widest text-[hsl(var(--accent))] block mb-0.5">Mission Target</span>
                            <span className="font-mono text-lg font-bold">{outpost.name}</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}