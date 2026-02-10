import {
    MapPin, Plus, Search, Hexagon, Layers,
    Maximize, MoreVertical, Trash2, Edit2, ExternalLink, Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx"
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiCall } from "@/utils/api.ts";

import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {useTheme} from "@/ThemeProvider.tsx";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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

const formatTimeAgo = (timestamp: number | null): string => {
    if (!timestamp) return "Never visited";

    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

export default function OutpostListScreen() {
    const [outposts, setOutposts] = useState<Outpost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const calculateGeoPolygonArea = (points: Array<{ x: number; y: number }>): number => {
        if (!points || points.length < 3) return 0;

        const EARTH_RADIUS = 6371000;
        const TO_RAD = Math.PI / 180;

        const centerLat = points.reduce((sum, p) => sum + p.y, 0) / points.length;
        const cosLat = Math.cos(centerLat * TO_RAD);

        let area = 0;

        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            const x1 = points[i].x * TO_RAD * EARTH_RADIUS * cosLat;
            const y1 = points[i].y * TO_RAD * EARTH_RADIUS;
            const x2 = points[j].x * TO_RAD * EARTH_RADIUS * cosLat;
            const y2 = points[j].y * TO_RAD * EARTH_RADIUS;

            area += (x1 * y2) - (x2 * y1);
        }

        return Math.abs(area) / 2 / 1_000_000;
    };

    const totalArea = outposts.reduce((acc, curr) => {
        return acc + calculateGeoPolygonArea(curr.area?.points || []);
    }, 0);

    useEffect(() => {
        const fetchOutposts = async () => {
            try {
                const data = await apiCall('/api/v1/outposts', undefined, "GET");

                if (Array.isArray(data)) {
                    const isSamePoint = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
                        const epsilon = 0.000001;
                        return Math.abs(p1.x - p2.x) < epsilon && Math.abs(p1.y - p2.y) < epsilon;
                    };

                    const cleanOutposts = data.map((op: Outpost) => {
                        const pts = op.area?.points || [];

                        if (pts.length >= 3) {
                            const first = pts[0];
                            const last = pts[pts.length - 1];

                            if (isSamePoint(first, last)) {
                                return {
                                    ...op,
                                    area: { ...op.area, points: pts.slice(0, -1) }
                                };
                            }
                        }
                        return op;
                    });

                    setOutposts(cleanOutposts);
                } else {
                    setOutposts([]);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOutposts();
    }, []);

    const filteredOutposts = outposts.filter(op =>
        (op.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const avgComplexity = outposts.length > 0
        ? (outposts.reduce((acc, o) => acc + (o.area?.points?.length || 0), 0) / outposts.length).toFixed(1)
        : "0.0";

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            <div className="flex-1 overflow-auto">
                <div className="max-w-[1400px] mx-auto p-4 lg:p-6 space-y-6">

                    {/* --- Page Header --- */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Outpost Overview</h1>
                                <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Manage operational zones and geofences</p>
                            </div>
                        </div>
                        <Link to="/outposts/new" className="w-full sm:w-auto">
                            <Button className="w-full bg-white text-black hover:bg-gray-200 h-10 shadow-lg shadow-white/5 flex justify-center">
                                <Plus size={16} className="mr-2" />
                                Create Outpost
                            </Button>
                        </Link>
                    </div>

                    {/* --- Stats Overview --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatsCard
                            title="Total Outposts"
                            value={outposts.length.toString()}
                            icon={<Hexagon size={24} />}
                            subtext="Active zones"
                        />
                        <StatsCard
                            title="Total Coverage"
                            value={`${totalArea.toFixed(1)} km²`}
                            icon={<Maximize size={24} />}
                            subtext="Geofenced area"
                            color="text-emerald-400"
                        />
                        <StatsCard
                            title="Avg. Complexity"
                            value={avgComplexity}
                            icon={<Layers size={24} />}
                            subtext="Vertices per polygon"
                        />
                    </div>

                    {/* --- Filters --- */}
                    <div className="flex items-center gap-4 bg-[hsl(var(--bg-secondary))] p-1 rounded-lg border border-[hsl(var(--border-primary))] w-full sm:w-fit">
                        <div className="relative group w-full sm:w-80">
                            <div className="absolute left-3 top-2.5 text-[hsl(var(--text-secondary))] group-focus-within:text-[hsl(var(--text-primary))] transition-colors">
                                <Search size={16} />
                            </div>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-9 pl-9 pr-4 rounded bg-transparent text-sm text-[hsl(var(--text-primary))] focus:outline-none placeholder:text-[hsl(var(--text-muted))]"
                                placeholder="Search outposts..."
                            />
                        </div>
                    </div>

                    {/* --- Grid Content --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {loading ? (
                            <p className="text-[hsl(var(--text-secondary))] col-span-full text-center py-10">Loading outposts...</p>
                        ) : filteredOutposts.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border border-dashed border-[hsl(var(--border-primary))] rounded-xl bg-[hsl(var(--bg-secondary))]/50">
                                <div className="w-12 h-12 rounded-full bg-[#282e39] flex items-center justify-center mb-4 text-[hsl(var(--text-secondary))]">
                                    <MapPin size={24} />
                                </div>
                                <h3 className="text-lg font-medium text-[hsl(var(--text-primary))]">No outposts found</h3>
                                <p className="text-sm text-[hsl(var(--text-secondary))] mt-1 max-w-sm">
                                    Get started by defining a new operational zone using the map editor.
                                </p>
                            </div>
                        ) : (
                            filteredOutposts.map((outpost) => (
                                <OutpostCard key={outpost.uuid} outpost={outpost} />
                            ))
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

function MapBoundsController({ points }: { points: { x: number, y: number }[] }) {
    const map = useMap();

    useEffect(() => {
        if (points && points.length > 0) {
            const bounds = points.map(p => [p.y, p.x] as [number, number]);
            map.fitBounds(bounds, { padding: [20, 20], animate: false });
        }
    }, [points, map]);

    return null;
}

function OutpostMapPreview({ outpost }: { outpost: Outpost }) {
    const centerPosition: [number, number] = [outpost.latitude, outpost.longitude];
    const polygonPositions = outpost.area?.points?.map(p => [p.y, p.x] as [number, number]) || [];

    const { theme } = useTheme();

    return (
        <MapContainer
            center={centerPosition}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
            attributionControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            boxZoom={false}
            keyboard={false}
            className="z-0 bg-[hsl(var(--bg-tertiary))]"
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
            {polygonPositions.length > 0 && (
                <>
                    <Polygon
                        positions={polygonPositions}
                        pathOptions={{
                            color: '#3b82f6',
                            fillColor: '#3b82f6',
                            fillOpacity: 0.15,
                            weight: 2,
                            dashArray: '5, 5'
                        }}
                    />
                    <MapBoundsController points={outpost.area!.points} />
                </>
            )}
        </MapContainer>
    );
}

function StatsCard({ title, value, icon, subtext, color = "text-[#135bec]" }: any) {
    return (
        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
            <CardContent className="p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider">{title}</p>
                        <h3 className="text-2xl font-bold text-[hsl(var(--text-primary))] mt-2">{value}</h3>
                        <p className="text-xs text-[hsl(var(--text-muted))] mt-1">{subtext}</p>
                    </div>
                    <div className={`p-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] ${color}`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function OutpostCard({ outpost }: { outpost: Outpost }) {
    const [lastVisited, setLastVisited] = useState<string>("Never visited");

    useEffect(() => {
        const storedVisit = localStorage.getItem(`last_visit_${outpost.uuid}`);
        if (storedVisit) {
            setLastVisited(formatTimeAgo(parseInt(storedVisit, 10)));
        }
    }, [outpost.uuid]);

    const handleVisit = () => {
        const now = Date.now();
        localStorage.setItem(`last_visit_${outpost.uuid}`, now.toString());
        setLastVisited(formatTimeAgo(now));
    };

    return (
        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] hover:border-[hsl(var(--border-secondary))] transition-all group overflow-hidden">
            <div className="h-32 bg-[hsl(var(--bg-tertiary))] relative overflow-hidden border-b border-[hsl(var(--border-primary))]">
                <OutpostMapPreview outpost={outpost} />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[hsl(var(--bg-secondary))] via-transparent to-transparent opacity-20" />
                <Badge variant="outline" className="absolute top-3 right-3 z-[400] bg-[hsl(var(--bg-secondary))]/90 backdrop-blur border-[hsl(var(--border-primary))] text-xs font-mono text-[hsl(var(--text-secondary))] shadow-sm">
                    {outpost.latitude.toFixed(4)}, {outpost.longitude.toFixed(4)}
                </Badge>
            </div>

            <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-base text-[hsl(var(--text-primary))]">{outpost.name}</CardTitle>
                        <CardDescription className="text-xs text-[hsl(var(--text-secondary))] mt-1 font-mono">
                            ID: {outpost.uuid.substring(0, 8)}...
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] -mr-2">
                                <MoreVertical size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))]">
                            <DropdownMenuItem asChild className="focus:bg-[#282e39] cursor-pointer">
                                <Link
                                    to={`/outposts/${outpost.uuid}`}
                                    className="flex items-center w-full"
                                    onClick={handleVisit}
                                >
                                    <ExternalLink size={14} className="mr-2" /> Open Details
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="focus:bg-[#282e39] cursor-pointer">
                                <Link to={`/outposts/${outpost.uuid}/edit`} className="flex items-center w-full">
                                    <Edit2 size={14} className="mr-2" /> Edit Geofence
                                </Link>
                            </DropdownMenuItem>
                            <div className="h-px bg-[#282e39] my-1" />
                            <DropdownMenuItem className="focus:bg-[#282e39] text-red-400 cursor-pointer">
                                <Trash2 size={14} className="mr-2" /> Decommission
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="bg-[hsl(var(--bg-tertiary))] rounded px-3 py-2 border border-[hsl(var(--border-primary))]">
                        <p className="text-[10px] text-[hsl(var(--text-secondary))] uppercase">Vertices</p>
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{outpost.area?.points?.length || 0}</p>
                    </div>
                    <div className="bg-[hsl(var(--bg-tertiary))] rounded px-3 py-2 border border-[hsl(var(--border-primary))]">
                        <p className="text-[10px] text-[hsl(var(--text-secondary))] uppercase">Created At</p>
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">
                            {new Date(outpost.created_at).toLocaleDateString("en-US", {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                            })}
                        </p>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[hsl(var(--border-primary))] flex items-center justify-between text-xs text-[hsl(var(--text-secondary))]">
                    <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        Active
                    </span>
                    <span className="flex items-center gap-1.5" title="Last visited time">
                        <Clock size={12} />
                        {lastVisited == "Never visited" ? "Never visited" : ("Visited " + lastVisited)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}