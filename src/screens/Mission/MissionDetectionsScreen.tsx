import {useEffect, useMemo, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import {
    ArrowLeft, Clock, MapPin,
    Crosshair, AlertTriangle,
    CheckCircle2, XCircle, Terminal,
    Filter, Download,
    ScanLine, Layers
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTheme } from "@/ThemeProvider.tsx";

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {apiCall} from "@/utils/api.ts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Detection {
    uuid: string;
    mission_uuid: string;
    detected_by_drone_uuid: string;
    object: string;
    confidence: number;
    false_positive: boolean;
    detected_at: string;
    location: { x: number; y: number };
    image_key: string;
}

type FilterStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'FALSE_POSITIVE';

export default function DetectionReviewScreen() {
    const { groupUuid, missionUuid } = useParams<{ groupUuid: string, missionUuid: string }>();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [detections, setDetections] = useState<Detection[]>([]);
    const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');

    const filteredDetections = useMemo(() => {
        return detections.filter(det => {
            if (activeFilter === 'ALL') return true;
            if (activeFilter === 'PENDING') return det.false_positive === null;
            if (activeFilter === 'CONFIRMED') return !det.false_positive;
            if (activeFilter === 'FALSE_POSITIVE') return det.false_positive;
            return true;
        });
    }, [detections, activeFilter]);

    useEffect(() => {
        apiCall("/api/v1/detections", {"group_uuid": groupUuid || "", "mission_uuid": missionUuid || ""}, "GET")
            .then(res => {
                setDetections(res);
            })
            .catch(e => {
                console.log("Error while fetching detections: ", e);
                setDetections([])
            })


    }, [missionUuid]);

    const handleOpenDetection = (detection: Detection) => {
        setSelectedDetection(detection);
        setIsModalOpen(true);
    };

    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const formatCoords = (lat: number, lng: number) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    return (
        <div className="flex flex-col h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] overflow-hidden font-mono">

            {/* --- Header --- */}
            <div className="flex-none h-16 border-b border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-secondary))] flex items-center justify-between px-6 z-10">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                            <AlertTriangle size={16} className="text-amber-500" />
                            Threat Review
                        </h1>
                        <p className="text-[10px] text-[hsl(var(--text-secondary))] uppercase tracking-widest">
                            Mission: {missionUuid?.substring(0, 8)}...
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--bg-tertiary))] rounded-md border border-[hsl(var(--border-primary))]">
                        <span className="text-[10px] text-[hsl(var(--text-muted))] uppercase">Pending Review</span>
                        <span className="text-xs font-bold text-amber-500">{detections.filter(d => d.false_positive === null).length}</span>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
                        <Download size={12} /> Export Report
                    </Button>
                </div>
            </div>

            {/* --- Main Layout --- */}
            <div className="flex-1 overflow-hidden relative flex">

                <div className="flex-1 md:max-w-xl border-r border-[hsl(var(--border-primary))] flex flex-col bg-[hsl(var(--bg-primary))]">
                    {/* Toolbar */}
                    <div className="h-10 border-b border-[hsl(var(--border-primary))] flex items-center px-4 justify-between bg-[hsl(var(--bg-tertiary))]/50">
                        <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--text-secondary))] uppercase font-bold">
                            <Layers size={12} />
                            Stream Sequence
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-6 text-[10px] gap-1 hover:text-[hsl(var(--text-primary))] ${activeFilter !== 'ALL' ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-muted))]'}`}
                                >
                                    <Filter size={10} />
                                    {activeFilter === 'ALL' ? 'Filter' : activeFilter.replace('_', ' ')}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] font-mono text-[10px]">
                                <DropdownMenuItem onClick={() => setActiveFilter('ALL')}>All</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveFilter('PENDING')} className="text-amber-500">Pending</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveFilter('CONFIRMED')} className="text-red-500">Confirmed</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveFilter('FALSE_POSITIVE')} className="text-emerald-500">False positive</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-0">
                        {filteredDetections && filteredDetections.length > 0 ? (
                            filteredDetections.map((det) => {
                                const isPending = det.false_positive === null;
                                const isSelected = selectedDetection?.uuid === det.uuid;

                                return (
                                    <div key={det.uuid} className="relative pl-6 pb-8 last:pb-0 group">
                                        {/* Timeline Line */}
                                        <div className="absolute left-[11px] top-3 bottom-0 w-px bg-[hsl(var(--border-primary))] group-last:hidden" />

                                        {/* Timeline Node */}
                                        <div className={`absolute left-0 top-1.5 h-[23px] w-[23px] rounded-full border-4 border-[hsl(var(--bg-primary))] flex items-center justify-center z-10 transition-colors
                                            ${isPending ? 'bg-amber-500/40 text-black animate-pulse' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-muted))] border-[hsl(var(--border-primary))]'}
                                        `}>
                                            {isPending ? (
                                                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                            ) : (
                                                <div className="w-1.5 h-1.5 bg-[hsl(var(--text-muted))] rounded-full" />
                                            )}
                                        </div>

                                        {/* Card */}
                                        <div onClick={() => handleOpenDetection(det)}
                                            className={`cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:translate-x-1
                                                ${isSelected? 'bg-[hsl(var(--accent))]/10 border-[hsl(var(--accent))] shadow-[0_0_15px_rgba(0,0,0,0.2)]'
                                                : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] hover:border-[hsl(var(--text-muted))]'}
                                                `}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline"
                                                           className={`text-[10px] px-1.5 h-5 border-[hsl(var(--border-primary))] ${
                                                               det.confidence > 0.9 ? 'text-red-400 bg-red-400/10' : 'text-amber-400 bg-amber-400/10'
                                                           }`}>
                                                        {(det.confidence * 100).toFixed(0)}%
                                                    </Badge>
                                                    <span className="text-xs font-bold text-[hsl(var(--text-primary))] uppercase tracking-wider">
                                                        {det.object}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-mono text-[hsl(var(--text-muted))] flex items-center gap-1">
                                                    <Clock size={10} /> {formatTime(det.detected_at)}
                                                </span>
                                            </div>

                                            <div className="flex gap-3">
                                                {/* Thumbnail Placeholder */}
                                                <div className="h-16 w-24 bg-black rounded border border-[hsl(var(--border-primary))] relative overflow-hidden flex-shrink-0 group-hover:border-[hsl(var(--text-muted))] transition-colors">
                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-zinc-950 opacity-50" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <ScanLine size={16} className="text-[hsl(var(--text-muted))] opacity-50" />
                                                    </div>
                                                    <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-red-500/50 box-border" />
                                                </div>

                                                {/* Meta Data */}
                                                <div className="flex-1 flex flex-col justify-between py-0.5">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--text-secondary))]">
                                                            <MapPin size={10} />
                                                            <span className="font-mono">{formatCoords(det.location.x, det.location.y)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--text-secondary))]">
                                                            <Terminal size={10} />
                                                            <span className="font-mono truncate w-32">{det.uuid}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end">
                                                        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${
                                                            det.false_positive === null ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                                                                !det.false_positive ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                        }`}>{det.false_positive === null ? "PENDING" : det.false_positive ? "FALSE POSITIVE" : "CONFIRMED"}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                                <ScanLine size={48} className="mb-4" />
                                <p className="text-xs uppercase tracking-widest font-bold">No detections found</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden md:flex flex-1 items-center justify-center bg-[hsl(var(--bg-tertiary))] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03]"
                         style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                    </div>
                    <div className="text-center opacity-30 select-none">
                        <Crosshair size={64} className="mx-auto mb-4 text-[hsl(var(--text-muted))]" />
                        <h2 className="text-xl font-bold uppercase tracking-[0.2em]">Select Target</h2>
                        <p className="font-mono text-xs mt-2">Awaiting operator input</p>
                    </div>
                </div>
            </div>

            {/* --- Detection Analysis Modal --- */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-6xl w-[95vw] h-[85vh] p-0 gap-0 bg-[hsl(var(--bg-primary))] border-[hsl(var(--border-primary))] flex flex-col overflow-hidden">

                    {selectedDetection && (
                        <>
                            {/* Modal Header */}
                            <DialogHeader className="px-6 py-4 border-b border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-secondary))] flex-none">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
                                            <AlertTriangle size={20} className="text-red-500" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-lg font-mono uppercase tracking-wide flex items-center gap-3">
                                                Target: {selectedDetection.object}
                                                <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">
                                                    {(selectedDetection.confidence * 100).toFixed(1)}% CONFIDENCE
                                                </Badge>
                                            </DialogTitle>
                                            <DialogDescription className="font-mono text-xs text-[hsl(var(--text-secondary))] mt-1 flex gap-4">
                                                <span>ID: {selectedDetection.uuid}</span>
                                                <span>|</span>
                                                <span>T: {selectedDetection.detected_at}</span>
                                            </DialogDescription>
                                        </div>
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="border-red-900/50 hover:bg-red-900/20 text-red-500">
                                            <XCircle size={16} className="mr-2" /> Mark False
                                        </Button>
                                        <Button className="bg-red-600 hover:bg-red-700 text-white border border-red-400/20">
                                            <CheckCircle2 size={16} className="mr-2" /> Confirm Threat
                                        </Button>
                                    </div>
                                </div>
                            </DialogHeader>

                            {/* Modal Body */}
                            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                                {/* Image Section */}
                                <div className="flex-1 bg-black relative flex items-center justify-center border-b md:border-b-0 md:border-r border-[hsl(var(--border-primary))]">
                                    <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur px-2 py-1 rounded border border-white/10">
                                        <span className="text-[10px] text-white/70 font-mono">SOURCE: Onboard camera</span>
                                    </div>
                                    <div className="w-full h-full relative group">
                                        {/* Placeholder Image */}
                                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                            <div className="text-zinc-700 flex flex-col items-center">
                                                <ScanLine size={48} />
                                                <span className="text-xs font-mono mt-2 uppercase tracking-widest">Image Data Unavailable</span>
                                            </div>
                                        </div>

                                        {/* Overlay HUD */}
                                        <div className="absolute inset-0 pointer-events-none border-[20px] border-transparent">
                                            {/* Corners */}
                                            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-red-500/50"></div>
                                            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-red-500/50"></div>
                                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-red-500/50"></div>
                                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-red-500/50"></div>

                                            {/* Bounding Box Simulation */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 border border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                                                <div className="absolute -top-5 left-0 bg-red-500 text-black text-[10px] font-bold px-1">
                                                    {(selectedDetection.confidence * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Map Section */}
                                <div className="flex-1 relative bg-[hsl(var(--bg-tertiary))]">
                                    <div className="absolute top-0 left-0 right-0 z-[400] bg-[hsl(var(--bg-secondary))]/90 backdrop-blur border-b border-[hsl(var(--border-primary))] px-4 py-2 flex justify-between items-center">
                                        <span className="text-[10px] font-bold uppercase text-[hsl(var(--text-secondary))] flex items-center gap-2">
                                            <MapPin size={12} /> Geo-Spatial Reference
                                        </span>
                                        <span className="font-mono text-[10px] text-[hsl(var(--text-primary))]">
                                            {formatCoords(selectedDetection.location.x, selectedDetection.location.y)}
                                        </span>
                                    </div>

                                    <MapContainer
                                        center={[selectedDetection.location.x, selectedDetection.location.y]}
                                        zoom={18}
                                        style={{ height: '100%', width: '100%' }}
                                        zoomControl={false}
                                    >
                                        {theme === "light" ? (
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution="&copy; OpenStreetMap"
                                            />
                                        ) : (
                                            <TileLayer
                                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                                attribution="&copy; OpenStreetMap &copy; CARTO"
                                            />
                                        )}
                                        <Marker position={[selectedDetection.location.x, selectedDetection.location.y]}>
                                            <Popup className="font-mono text-xs">
                                                {selectedDetection.object} <br/>
                                                {(selectedDetection.confidence * 100).toFixed(1)}%
                                            </Popup>
                                        </Marker>
                                        {/* Accuracy Circle */}
                                        <Circle
                                            center={[selectedDetection.location.x, selectedDetection.location.y]}
                                            radius={20}
                                            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1, weight: 1, dashArray: '5, 5' }}
                                        />
                                    </MapContainer>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}