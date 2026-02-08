import { useState, useEffect } from "react";
import {useParams, useNavigate, useLocation} from "react-router-dom";
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import { ArrowLeft, Rocket, Map as MapIcon, ShieldCheck, Ruler } from 'lucide-react';
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import "leaflet/dist/leaflet.css";

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {OutpostSummary} from "@/models/Outpost.ts";

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

function MapController({ bounds }: { bounds: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
}

export default function MissionCreationScreen() {
    const { groupUuid } = useParams<{ groupUuid: string }>();

    const outpostSummary: OutpostSummary = useLocation().state?.groupData;

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [outpost, setOutpost] = useState<OutpostData | null>(null);
    const [missionAltitude, setMissionAltitude] = useState([50]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            // Mock API delay
            await new Promise(resolve => setTimeout(resolve, 800));

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
    }, [groupUuid]);

    const handleConfirmMission = async () => {
        if (!outpost) return;
        setIsSubmitting(true);

        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/missions');
    };

    if (loading || !outpost) {
        return <div className="flex h-screen items-center justify-center text-[hsl(var(--text-secondary))] font-mono animate-pulse">ACQUIRING TARGET DATA...</div>;
    }

    return (
        <div className="flex h-full flex-col md:flex-row bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))]">

            {/* --- Left Sidebar: Confirmation Details --- */}
            <div className="w-full md:w-96 border-r border-[hsl(var(--border-primary))] flex flex-col bg-[hsl(var(--bg-secondary))] z-10 shadow-xl">
                <div className="p-4 border-b border-[hsl(var(--border-primary))]">
                    <div className="flex items-center gap-2 mb-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8 -ml-2 text-[hsl(var(--text-secondary))]">
                            <ArrowLeft size={18} />
                        </Button>
                        <h1 className="font-bold text-lg tracking-tight">Mission Authorization</h1>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono text-[hsl(var(--text-muted))]">
                        <span>TARGET: <span className="text-[hsl(var(--text-primary))]">{outpost.name}</span></span>
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 bg-emerald-500/10">READY</Badge>
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
                                        ~{outpostSummary.area && outpostSummary.area.points.length >= 3 && (
                                        <>
                                            ~{(
                                            Math.abs(outpostSummary.area.points[0].x - outpostSummary.area.points[2].x) * 111 *
                                            Math.abs(outpostSummary.area.points[0].y - outpostSummary.area.points[1].y) * 111
                                        ).toFixed(2)} km²
                                        </>
                                    )} km²
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
                        className="w-full h-12 text-md font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                        onClick={handleConfirmMission}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            "INITIALIZING..."
                        ) : (
                            <>
                                <Rocket className="mr-2 h-4 w-4" />
                                CONFIRM LAUNCH
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="flex-1 relative h-[50vh] md:h-full bg-gray-900">
                <MapContainer
                    center={[outpost.latitude, outpost.longitude]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                    className="z-0"
                    zoomControl={false}
                    dragging={false}
                    scrollWheelZoom={false}
                    doubleClickZoom={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />

                    {/* @ts-ignore */}
                    <MapController bounds={outpostSummary.area.points.map(p => [p.y, p.x] as [number, number])} />

                    {/* @ts-ignore */}
                    <Polygon positions={outpostSummary.area.points.map(p => [p.y, p.x] as [number, number])}
                        pathOptions={{
                            color: '#3b82f6',
                            fillColor: '#3b82f6',
                            fillOpacity: 0.15,
                            weight: 2,
                            dashArray: '10, 5'
                        }}
                    />
                </MapContainer>

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