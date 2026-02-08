import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import {
    ArrowLeft, ShieldCheck, Ruler, PanelLeft, Activity, SatelliteDishIcon
} from 'lucide-react';
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import "leaflet/dist/leaflet.css";

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { OutpostSummary } from "@/models/Outpost.ts";
import {useTheme} from "@/ThemeProvider.tsx";

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
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [points, map]);
    return null;
}

export default function MissionCreationScreen() {
    const { groupUuid } = useParams<{ groupUuid: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const outpostSummary: OutpostSummary = location.state?.groupData;
    const [outpost, setOutpost] = useState<OutpostData | null>(null);

    const [loading, setLoading] = useState(true);
    const [missionAltitude, setMissionAltitude] = useState([50]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { theme } = useTheme();

    useEffect(() => {
        const fetchData = async () => {
            if (!outpostSummary) {
                navigate('/outposts');
                return;
            }

            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500));

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
        return outpost.boundary.map(p => [p.x, p.y] as [number, number]);
    }, [outpost]);

    const handleConfirmMission = async () => {
        if (!outpost) return;
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigate('/missions');
    };

    if (loading || !outpost) {
        return <div className="flex h-screen items-center justify-center bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-secondary))] font-mono animate-pulse">Acquiring outpost data...</div>;
    }

    return (
        <div className="flex h-screen flex-col md:flex-row bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] overflow-hidden">

            {/* --- Mobile Backdrop --- */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[1400] md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* --- Left Sidebar: Confirmation Details --- */}
            <aside className={`
                fixed md:relative
                inset-y-0 left-0
                w-[85vw] md:w-96
                border-r border-[hsl(var(--border-primary))] 
                flex flex-col 
                bg-[hsl(var(--bg-secondary))] 
                z-[1500] md:z-10 
                shadow-2xl
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-4 border-b border-[hsl(var(--border-primary))]">
                    <div className="flex items-center gap-2 mb-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8 -ml-2 text-[hsl(var(--text-secondary))]">
                            <ArrowLeft size={18} />
                        </Button>
                        <h1 className="font-bold text-lg tracking-tight">Mission Authorization</h1>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono text-[hsl(var(--text-muted))]">
                        <span>TARGET: <span className="text-[hsl(var(--text-primary))]">{outpost.name}</span></span>
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 bg-emerald-500/10">Ready</Badge>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* Mission Summary Card */}
                    <Card className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium uppercase text-[hsl(var(--text-secondary))]">Directives</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="text-blue-400 mt-1" size={16} />
                                <div className="text-sm">
                                    <p className="font-medium text-blue-400">Reconnaissance</p>
                                    <p className="text-[hsl(var(--text-muted))] text-xs leading-relaxed">
                                        Perform full area survey of assigned outpost boundary. Drone swarm will autogenerate flight paths based on coverage density.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Ruler className="text-[hsl(var(--text-secondary))] mt-1" size={16} />
                                <div className="text-sm">
                                    <p className="font-medium">Area Coverage</p>
                                    <p className="text-[hsl(var(--text-muted))] text-xs font-mono">
                                        Configured Boundary
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Flight Parameters */}
                    <Card className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium uppercase text-[hsl(var(--text-secondary))]">Flight Parameters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <Label>Survey Altitude (AGL)</Label>
                                    <span className="font-mono text-emerald-400">{missionAltitude[0]}m</span>
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
                                <div className="flex justify-between text-[10px] text-[hsl(var(--text-muted))] font-mono">
                                    <span>High Res (20m)</span>
                                    <span>Fast Scan (120m)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-secondary))]">
                    <Button
                        className="w-full h-12 text-md bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                        onClick={handleConfirmMission}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <><Activity className="animate-spin mr-2 h-4 w-4" /> Initializing...</>
                        ) : (
                            <>
                                <SatelliteDishIcon className="mr-1 h-8 w-8" />
                                Confirm mission
                            </>
                        )}
                    </Button>
                </div>
            </aside>

            {/* --- Right Side: Map Visualization --- */}
            <div className="flex-1 relative bg-gray-900 h-full">
                <MapContainer
                    center={[outpost.latitude, outpost.longitude]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                    className="z-0 bg-[#0B0D10]"
                    zoomControl={false}
                    dragging={true}
                >

                    {theme == "light" ?
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&COPY OpenStreetMap"
                        /> :
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                        />
                    }

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

                {/* --- MOBILE: Sidebar Toggle Button --- */}
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-4 left-4 z-[1000] md:hidden shadow-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))]"
                    onClick={() => setSidebarOpen(true)}
                >
                    <PanelLeft size={20} />
                </Button>

                {/* HUD Overlay */}
                <div className="absolute top-6 right-6 z-[400] flex flex-col items-end gap-2 pointer-events-none">
                    <div className="bg-black/80 backdrop-blur text-white px-4 py-2 rounded-md border border-blue-500/30">
                        <span className="text-[10px] uppercase tracking-widest text-blue-400 block mb-1">Target Zone</span>
                        <span className="font-mono text-xl font-bold">{outpost.name}</span>
                    </div>
                </div>

                <div className="absolute bottom-6 left-6 z-[400] bg-black/80 backdrop-blur text-white px-3 py-1 rounded text-xs font-mono border border-white/10 pointer-events-none">
                    <span className="text-gray-400">CENTER:</span> {outpost.latitude.toFixed(4)}, {outpost.longitude.toFixed(4)}
                </div>
            </div>
        </div>
    );
}