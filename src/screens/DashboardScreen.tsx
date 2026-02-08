import {
    Activity, MapPin, AlertCircle, TrendingUp, Map as MapIcon,
    ChevronLeft, ChevronRight, CheckCircle, XCircle, SquareArrowOutUpRight
} from 'lucide-react';
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip.tsx"
import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polygon, Tooltip as LeafletTooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { latLngBounds } from 'leaflet';
import { Link } from "react-router-dom";
import { apiCall } from "@/utils/api.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {useTheme} from "@/ThemeProvider.tsx";

function MapController({ bounds }: { bounds: any }) {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
    }, [bounds, map]);
    return null;
}

interface Mission {
    uuid: string;
    start_time: number;
    groupUUID?: string;
}

interface Outpost {
    uuid: string;
    name: string;
    latitude: number;
    longitude: number;
    area?: {
        points: Array<{ x: number; y: number }>;
    };
    created_at: string;
}

interface Check {
    name: string,
    status: "UP" | "DOWN",
    data?: any
}

interface Health {
    status: "UP" | "DOWN",
    checks: Array<Check>,
}

export default function DashboardScreen() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [outposts, setOutposts] = useState<Outpost[]>([]);
    const [health, setHealth] = useState<Health>()
    const [loading, setLoading] = useState(true);

    const [currentOutpostIndex, setCurrentOutpostIndex] = useState(0);

    const { theme } = useTheme();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [missionsRes, outpostsRes] = await Promise.all([
                    apiCall('/api/v1/missions', undefined, "GET"),
                    apiCall('/api/v1/outposts', undefined, "GET"),
                ]);

                setMissions(Array.isArray(missionsRes) ? missionsRes : []);
                setOutposts(Array.isArray(outpostsRes) ? outpostsRes : []);

                try {
                    const healthRes = await apiCall('/q/health', undefined, "GET");
                    setHealth(healthRes);
                } catch (error: any) {
                    if (error.status === 503 && error.data) {
                        setHealth(error.data);
                    } else {
                        setHealth({ status: "DOWN", checks: [] });
                    }
                }

            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const nextOutpost = () => {
        if (outposts.length === 0) return;
        setCurrentOutpostIndex((prev) => (prev + 1) % outposts.length);
    };

    const prevOutpost = () => {
        if (outposts.length === 0) return;
        setCurrentOutpostIndex((prev) => (prev - 1 + outposts.length) % outposts.length);
    };

    const currentOutpost = outposts[currentOutpostIndex];

    const currentBounds = useMemo(() => {
        if (!currentOutpost?.area?.points) return undefined;

        const points = currentOutpost.area.points.map(p => [
            p.y,
            p.x
        ] as [number, number]);

        return latLngBounds(points);
    }, [currentOutpost]);

    const isSystemHealthy = health?.status === 'UP';
    const statusColor = isSystemHealthy ? 'text-emerald-400' : 'text-red-400';
    const StatusIcon = isSystemHealthy ? CheckCircle : AlertCircle;

    return (
        <div className="flex flex-col h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            <div className="flex-1 overflow-auto">
                <div className="max-w-[1400px] mx-auto p-4 lg:p-6 space-y-6 pb-20">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Operations Dashboard</h1>
                            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Monitor fleet activity and system status</p>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-[hsl(var(--text-secondary))] mb-1">Your Missions</p>
                                        <div className="flex items-center gap-2">
                                            {loading ? (
                                                <Skeleton className="h-9 w-12 bg-[hsl(var(--bg-tertiary))]" />
                                            ) : (
                                                <p className="text-3xl font-bold">
                                                    {missions ? missions.length : 0}
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                                            <TrendingUp size={12} /> Active
                                        </p>
                                    </div>
                                    <div className="text-[#135bec]"><Activity size={32} /></div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-[hsl(var(--text-secondary))] mb-1">Registered Outposts</p>
                                        {loading ? (
                                            <Skeleton className="h-9 w-12 bg-[hsl(var(--bg-tertiary))]" />
                                        ) : (
                                            <p className="text-3xl font-bold">{outposts ? outposts.length : 0}</p>
                                        )}
                                        <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">Operational zones</p>
                                    </div>
                                    <div className="text-emerald-400"><MapPin size={32} /></div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* System Status Card */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] cursor-help hover:bg-[hsl(var(--bg-tertiary))]/50 transition-colors">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-[hsl(var(--text-secondary))] mb-1">System Status</p>
                                                    {loading ? (
                                                        <Skeleton className="h-9 w-32 bg-[hsl(var(--bg-tertiary))]" />
                                                    ) : (
                                                        <p className={`text-3xl font-bold ${statusColor}`}>
                                                            {isSystemHealthy ? "Operational" : "Degraded"}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
                                                        {loading ? "Checking services..." : isSystemHealthy ? "All systems nominal" : "Issues detected"}
                                                    </p>
                                                </div>
                                                <div className={statusColor}>
                                                    {loading ? <Skeleton className="h-8 w-8 rounded-full" /> : <StatusIcon size={32} />}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TooltipTrigger>
                                <TooltipContent className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] p-3 shadow-xl max-w-[400px]">
                                    <div className="space-y-2 min-w-[200px]">
                                        <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] border-b border-[hsl(var(--border-primary))] pb-1 mb-2">Service Health Checks</p>
                                        {health?.checks && health.checks.length > 0 ? (
                                            health.checks.map((check, idx) => (
                                                <div key={idx} className="flex items-center justify-between gap-4 text-sm">
                                                    <span className="font-medium break-words">{check.name}</span>
                                                    {check.status === 'UP' ? (
                                                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-mono font-bold shrink-0">
                                                            <CheckCircle size={12} /> UP
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-red-400 text-xs font-mono font-bold shrink-0">
                                                            <XCircle size={12} /> DOWN
                                                        </span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-[hsl(var(--text-secondary))]">No health checks available.</p>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Mission Feed */}
                        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                            <CardHeader>
                                <CardTitle className="text-lg">Recent Missions</CardTitle>
                                <CardDescription className="text-[hsl(var(--text-secondary))]">
                                    Latest mission activity
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {loading ? (
                                        <div className="flex justify-center p-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        </div>
                                    ) : missions.length === 0 ? (
                                        <div className="text-center py-8 text-[hsl(var(--text-secondary))] border border-dashed border-[hsl(var(--border-secondary))] rounded-lg">
                                            <p className="text-sm">No missions found</p>
                                        </div>
                                    ) : (
                                        missions.slice(0, 5).map((mission) => (
                                            <div key={mission.uuid} className="flex items-center justify-between p-3 bg-[hsl(var(--bg-tertiary))] rounded-lg border border-[hsl(var(--border-primary))]">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium font-mono text-[hsl(var(--accent))]">
                                                        {mission.uuid.substring(0, 8)}...
                                                    </p>
                                                    <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
                                                        Launched: {new Date(mission.start_time * 1000).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                                    Active
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">Quick navigation</CardTitle>
                                    <CardDescription className="text-[hsl(var(--text-secondary))]">
                                        {outposts.length > 0 ? (
                                            <>Viewing <span className="text-[hsl(var(--accent))] font-medium">{currentOutpost?.name}</span> ({currentOutpostIndex + 1}/{outposts.length})</>
                                        ) : (
                                            "Operational zones map"
                                        )}
                                    </CardDescription>
                                </div>
                                {outposts.length > 0 && (
                                    <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link to={`/outposts/${outposts[currentOutpostIndex].uuid}`}>
                                                        <Button variant="outline" size="icon" className="h-8 w-8 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))]">
                                                            <SquareArrowOutUpRight className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Go to overview</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="outline" size="icon" onClick={prevOutpost} className="h-8 w-8 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))]">
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Previous outpost</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="outline" size="icon" onClick={nextOutpost} className="h-8 w-8 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))]">
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Next outpost</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent>
                                {!outposts || outposts.length === 0 ? (
                                    <div className="h-[300px] w-full rounded-lg border-2 border-dashed border-[hsl(var(--border-secondary))] flex flex-col items-center justify-center text-[hsl(var(--text-secondary))] bg-[hsl(var(--bg-tertiary))]/10">
                                        <MapIcon className="h-10 w-10 mb-2 opacity-20" />
                                        <p className="text-sm font-medium">No outposts detected</p>
                                    </div>
                                ) : (
                                    <div className="h-[300px] rounded-lg overflow-hidden relative border border-[hsl(var(--border-secondary))]">
                                        <MapContainer
                                            center={[0, 0]}
                                            zoom={13}
                                            style={{ height: "100%", width: "100%" }}
                                            zoomControl={false}
                                            scrollWheelZoom={false}
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

                                            {/* Updates view when outpost changes */}
                                            {currentBounds && <MapController bounds={currentBounds} />}

                                            {currentOutpost?.area?.points && (
                                                <Polygon
                                                    key={currentOutpost.uuid}
                                                    positions={currentOutpost.area.points.map(p => [
                                                        p.y, // Lat
                                                        p.x  // Lng
                                                    ] as [number, number])}
                                                    pathOptions={{
                                                        color: '#3b82f6',
                                                        fillColor: '#3b82f6',
                                                        fillOpacity: 0.2,
                                                        weight: 2
                                                    }}
                                                >
                                                    <LeafletTooltip
                                                        permanent
                                                        direction="center"
                                                        className="bg-transparent border-0 text-white font-bold shadow-none"
                                                    >
                                                        {currentOutpost.name}
                                                    </LeafletTooltip>
                                                </Polygon>
                                            )}
                                        </MapContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}