import { Canvas } from "@react-three/fiber";
import { useGLTF, PresentationControls, Html, Environment, Stage } from "@react-three/drei";
import { Suspense, useEffect, useState, useMemo, memo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import {
    ArrowLeft, Cpu, Wifi, Shield,
    Camera, Navigation, Thermometer,
    Zap, AlertCircle, MapPin, Box, Terminal,
    Activity, Clock, Server, FileText, Pause
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiCall } from "@/utils/api.ts";

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useTheme } from "@/ThemeProvider.tsx";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Drone {
    uuid: string;
    name: string;
    group_uuid: string;
    address: string;
    manager_version: string;
    first_discovered: string;
    home_position: { x: number; y: number; z: number };
    model: string;
    capabilities: Array<string>;
}

interface TerminalEntry {
    type: "command" | "output" | "error";
    content: string;
}

const AVAILABLE_MODELS = ["x500", "typhoon"];
const DEFAULT_MODEL = "x500";

AVAILABLE_MODELS.forEach(model => useGLTF.preload(`/models/${model}.model.glb`));

const CommanderConsole = ({ droneName, droneId }: { droneName: string, droneId: string }) => {
    const [logs, setLogs] = useState<TerminalEntry[]>([
        { type: "output", content: `[SYSTEM] MAVSDK Server initialized on port 50051` },
        { type: "output", content: `[LINK] Waiting for heartbeat from ${droneId.split('-')[0]}...` },
        { type: "output", content: `[LINK] Heartbeat detected (MAVLink v2)` },
        { type: "output", content: `[PARAM] Requesting parameters... OK` },
    ]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [logs]);

    const handleCommand = (cmd: string) => {
        if(!cmd.trim()) return;

        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        setLogs(prev => [...prev, { type: "command", content: `[${timestamp}] > ${cmd.toUpperCase()}` }]);

        setTimeout(() => {
            setLogs(prev => [...prev, { type: "output", content: `[ACK] Command accepted: ${cmd.split(' ')[0]}` }]);
        }, 200);

        setInput("");
    };

    return (
        <div className="flex flex-col h-[600px] w-full bg-[#09090b] text-zinc-300 font-mono text-xs overflow-hidden border border-zinc-800 rounded-lg shadow-2xl">

            <div className="h-12 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between px-4 select-none shrink-0">
                <div className="flex items-center gap-3 mr-2">
                    <div className="p-1.5 bg-amber-500/10 rounded border border-amber-500/20">
                        <Terminal size={12} className="text-amber-500" />
                    </div>
                    <span className="mt-[0.2em] font-bold text-zinc-100 tracking-wide uppercase">{droneName}</span>
                </div>
            </div>

            {/* Full Width Terminal */}
            <div className="flex-1 flex flex-col bg-[#050505] relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                     style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                {/* Scrollable Logs */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-[11px] z-10 scrollbar-thin scrollbar-thumb-zinc-800">
                    {logs.map((log, i) => (
                        <div key={i} className={`flex gap-2 ${log.type === 'command' ? 'text-amber-500' : 'text-zinc-400'}`}>
                            <span className="opacity-30 select-none w-[30px] text-right">
                                {(i + 1).toString().padStart(3, '0')}
                            </span>
                            <span>{log.content}</span>
                        </div>
                    ))}
                    <div className="h-4" />
                </div>
            </div>

            {/* Input */}
            <div className="h-10 bg-zinc-900 border-t border-zinc-800 flex items-center px-2 gap-2 shrink-0">
                <span className="text-amber-500 px-2 text-xs font-bold">MAV{'>'}</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCommand(input)}
                    className="flex-1 bg-transparent border-none outline-none text-xs text-zinc-300 placeholder-zinc-700 font-mono h-full"
                    placeholder="Enter MAVLink command (e.g., 'commander takeoff')"
                    autoFocus
                />
            </div>
        </div>
    );
};

const DroneModel = memo(({ model }: { model: string }) => {
    const safeModel = AVAILABLE_MODELS.includes(model) ? model : DEFAULT_MODEL;
    const { scene } = useGLTF(`/models/${safeModel}.model.glb`);
    const clonedScene = useMemo(() => scene.clone(), [scene]);
    return <primitive object={clonedScene} />;
});

function Loader() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--accent))]"></div>
                <span className="text-xs font-mono uppercase tracking-widest text-[hsl(var(--text-muted))]">Loading Asset...</span>
            </div>
        </Html>
    );
}

const DroneVisualizer = memo(({ modelName }: { modelName: string }) => {
    return (
        <div className="w-full h-full min-h-[400px] bg-gradient-to-b from-[hsl(var(--bg-secondary))] to-[hsl(var(--bg-tertiary))] rounded-lg overflow-hidden relative">
            <Canvas
                dpr={[1, 1.5]}
                shadows={false}
                camera={{ fov: 45, position: [0, 0, 5] }}
                gl={{ antialias: true, powerPreference: "high-performance" }}
            >
                <Suspense fallback={<Loader />}>
                    <Environment preset="city" />
                    <Stage environment={null} intensity={0.5} contactShadow={false} shadowBias={-0.0015}>
                        <PresentationControls
                            config={{ mass: 1, tension: 170, friction: 26 }}
                            global
                            zoom={0.8}
                            polar={[-0.2, Math.PI / 2]}
                        >
                            <DroneModel model={modelName} />
                        </PresentationControls>
                    </Stage>
                </Suspense>
            </Canvas>

            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-[10px] font-mono text-white/70 pointer-events-none">
                Interactive 3D
            </div>
        </div>
    );
});

export default function DroneDetailsScreen() {
    const { droneUuid } = useParams<{ droneUuid: string }>();
    const navigate = useNavigate();

    const [drone, setDrone] = useState<Drone | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isConsoleOpen, setIsConsoleOpen] = useState(false);

    const { theme } = useTheme();

    useEffect(() => {
        if (!droneUuid) return;
        const fetchDrone = async () => {
            setLoading(true);
            try {
                const data = await apiCall(`/api/v1/drones/${droneUuid}`, undefined, "GET");
                setDrone(data);
            } catch (e) {
                console.error("Error fetching drone:", e);
                setError("Failed to load drone telemetry.");
            } finally {
                setLoading(false);
            }
        };
        fetchDrone();
    }, [droneUuid]);

    const getCapabilityIcon = (cap: string) => {
        const c = cap.toLowerCase();
        if (c.includes('gps') || c.includes('rtk')) return Navigation;
        if (c.includes('camera') || c.includes('optic')) return Camera;
        if (c.includes('thermal')) return Thermometer;
        if (c.includes('avoid') || c.includes('lidar')) return Shield;
        if (c.includes('wifi') || c.includes('telemetry')) return Wifi;
        if (c.includes('compute') || c.includes('pi')) return Cpu;
        return Zap;
    };

    if (loading) {
        return (
            <div className="h-screen w-full bg-[hsl(var(--bg-primary))] flex flex-col items-center justify-center gap-2 text-[hsl(var(--text-secondary))]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--text-primary))]"></div>
                <span className="font-mono text-sm animate-pulse">Establishing uplink...</span>
            </div>
        );
    }

    if (error || !drone) {
        return (
            <div className="h-screen w-full bg-[hsl(var(--bg-primary))] flex flex-col items-center justify-center gap-4 text-red-500">
                <AlertCircle size={48} />
                <p>{error || "Drone not found"}</p>
                <Button variant="outline" onClick={() => navigate(-1)}>Return to Fleet</Button>
            </div>
        );
    }

    const position: [number, number] = [drone.home_position.y, drone.home_position.x];

    return (
        <div className="pb-[4.5em] flex flex-col h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-mono overflow-hidden">
            <div className="flex-1 overflow-auto">
                <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">

                    {/* --- Header --- */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(-1)}
                                className="h-9 w-9 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-secondary))]"
                            >
                                <ArrowLeft size={20} />
                            </Button>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl tracking-tight">{drone.name}</h1>
                                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1">
                                        <Activity size={12} className="animate-pulse" /> ONLINE
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[hsl(var(--text-secondary))] mt-1 font-mono">
                                    <span>UUID: {drone.uuid.split('-')[0]}...</span>
                                    <span className="w-1 h-1 rounded-full bg-[hsl(var(--text-muted))]" />
                                    <span className="uppercase" >MODEL: {drone.model}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))]">
                                <FileText size={16} className="mr-2" /> Logs
                            </Button>

                            {/* --- Console Modal --- */}
                            <Dialog open={isConsoleOpen} onOpenChange={setIsConsoleOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-white text-black hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300">
                                        <Terminal size={16} className="mr-2" />
                                        <span className="font-mono">Console</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-5xl bg-zinc-950 p-0 border-zinc-800 shadow-2xl">
                                    <DialogHeader className="sr-only">
                                        <DialogTitle>MAVLink Commander</DialogTitle>
                                    </DialogHeader>
                                    <CommanderConsole droneName={drone.name} droneId={drone.uuid} />
                                </DialogContent>
                            </Dialog>

                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        <div className="lg:col-span-2 space-y-6">
                            {/* 3D Visualizer Card */}
                            <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] overflow-hidden">
                                <CardHeader className="py-3 px-4 border-b border-[hsl(var(--border-primary))] flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Box size={16} className="text-[hsl(var(--text-secondary))]" />
                                        <span className="font-medium text-sm">Digital Twin</span>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={`font-mono text-[10px] transition-colors duration-300 ${
                                            isConsoleOpen
                                                ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                                                : "text-[hsl(var(--text-muted))]"
                                        }`}
                                    >
                                        {isConsoleOpen ? "SUSPENDED" : "LIVE RENDER"}
                                    </Badge>
                                </CardHeader>

                                <div className="h-[450px] w-full bg-[hsl(var(--bg-tertiary))] relative">
                                    {isConsoleOpen ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(var(--bg-tertiary))] z-10">
                                            {/* Logo / Icon Container */}
                                            <div className="relative group cursor-default">
                                                <div className="absolute -inset-4 bg-[hsl(var(--primary))] rounded-full opacity-0 group-hover:opacity-10 animate-pulse transition-opacity duration-700"></div>

                                                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-primary))] shadow-xl">
                                                    <Pause
                                                        size={32}
                                                        className="text-[hsl(var(--text-secondary))]"
                                                        fill="currentColor"
                                                        fillOpacity={0.1}
                                                    />
                                                </div>
                                            </div>

                                            {/* Text Label */}
                                            <div className="mt-6 flex flex-col items-center gap-1.5">
                                                <span className="text-xs font-bold tracking-[0.2em] text-[hsl(var(--text-secondary))] uppercase">
                                                    Render Paused
                                                </span>
                                                <span className="text-[10px] font-mono text-[hsl(var(--text-muted))]">
                                                    Resources allocated to Terminal
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <DroneVisualizer modelName={drone.model} />
                                    )}
                                </div>
                            </Card>

                            {/* System Status Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                                    <CardContent className="p-4 flex flex-col gap-1">
                                        <span className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Protocol</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Wifi size={18} className="text-emerald-400" />
                                            <span className="text-lg">MAVLink v2</span>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                                    <CardContent className="p-4 flex flex-col gap-1">
                                        <span className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Agent Version</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Server size={18} className="text-blue-400" />
                                            <span className="text-lg">{drone.manager_version}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                                    <CardContent className="p-4 flex flex-col gap-1">
                                        <span className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Uptime</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock size={18} className="text-yellow-400" />
                                            <span className="text-lg">04:12:33</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Right Column (Map & Capabilities) - Unchanged */}
                        <div className="space-y-6">

                            {/* Map Card */}
                            <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] flex flex-col h-[380px]">
                                <CardHeader className="py-3 px-4 border-b border-[hsl(var(--border-primary))]">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <MapPin size={16} className="text-[hsl(var(--text-secondary))]" />
                                        Current Location
                                    </CardTitle>
                                </CardHeader>
                                <div className="flex-1 relative z-0">
                                    <MapContainer
                                        center={position}
                                        zoom={15}
                                        style={{ height: '100%', width: '100%' }}
                                        zoomControl={false}
                                        attributionControl={false}
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
                                        <Marker position={position}>
                                            <Popup className="text-xs">{drone.address}</Popup>
                                        </Marker>
                                    </MapContainer>

                                    {/* Map Overlay Info */}
                                    <div className="absolute bottom-3 left-3 right-3 bg-[hsl(var(--bg-secondary))]/90 backdrop-blur border border-[hsl(var(--border-primary))] rounded-md p-2 z-[400] shadow-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[10px] text-[hsl(var(--text-secondary))] uppercase">Network Address</p>
                                                <p className="text-xs font-mono text-[hsl(var(--text-primary))] mt-0.5">{drone.address}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-[hsl(var(--text-secondary))] uppercase">Coordinates</p>
                                                <p className="text-[10px] font-mono text-[hsl(var(--text-muted))] mt-0.5">
                                                    {position[0].toFixed(5)}, {position[1].toFixed(5)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Capabilities List */}
                            <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                                <CardHeader className="py-3 px-4 border-b border-[hsl(var(--border-primary))]">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Shield size={16} className="text-[hsl(var(--text-secondary))]" />
                                        Registered Capabilities
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {drone.capabilities && drone.capabilities.length > 0 ? (
                                            <div className="divide-y divide-[hsl(var(--border-primary))]">
                                                {drone.capabilities.map((cap, i) => {
                                                    const Icon = getCapabilityIcon(cap);
                                                    return (
                                                        <div key={i} className="flex items-center justify-between p-3 hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 rounded-md bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))]">
                                                                    <Icon size={14} />
                                                                </div>
                                                                <span className="text-sm font-medium text-[hsl(var(--text-secondary))] capitalize">{cap}</span>
                                                            </div>
                                                            <Badge variant="outline" className="text-[10px] border-[hsl(var(--border-primary))] text-[hsl(var(--text-muted))]">
                                                                ACTIVE
                                                            </Badge>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-6 text-center text-sm text-[hsl(var(--text-muted))] italic">
                                                No capabilities advertised
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="py-3 px-4 bg-[hsl(var(--bg-tertiary))] border-t border-[hsl(var(--border-primary))]">
                                    <p className="text-[10px] text-[hsl(var(--text-muted))] w-full text-center">
                                        Registered Date: {new Date(drone.first_discovered).toLocaleDateString()}
                                    </p>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}