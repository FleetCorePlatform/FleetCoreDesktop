import {
    MapPin, Plus, Search, Hexagon, Layers,
    Maximize, MoreVertical, Trash2, Edit2, ExternalLink
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
import {apiCall} from "@/utils/api.ts";

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

export default function OutpostListScreen() {
    const [outposts, setOutposts] = useState<Outpost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const totalArea = outposts.reduce((acc, curr) => {
        return acc + (curr.area?.points ? 4.2 : 0);
    }, 0);

    useEffect(() => {
        const fetchOutposts = async () => {
            try {
                const outposts = await apiCall('/api/v1/outposts', undefined, "GET");

                setOutposts(Array.isArray(outposts) ? outposts : []);
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

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            <div className="flex-1 overflow-auto">
                <div className="max-w-[1400px] mx-auto p-4 lg:p-6 space-y-6">

                    {/* --- Page Header --- */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Outpost Overview</h1>
                            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Manage operational zones and geofences</p>
                        </div>
                        <Link to="/outposts/new">
                            {/* Assumes your creation screen is at /outposts/new */}
                            <Button className="bg-white text-black hover:bg-gray-200 h-10 shadow-lg shadow-white/5">
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
                            value="4.2"
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

// --- Subcomponents ---

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
    return (
        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] hover:border-[hsl(var(--border-secondary))] transition-all group overflow-hidden">

            {/* Fake Map Preview Header */}
            <div className="h-32 bg-[hsl(var(--bg-tertiary))] relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center"
                    style={{ backgroundImage: `url('https://placeholder.pics/svg/600x400/1c1f27/282e39-3b4354/Map%20Preview')` }}
                />
                {/* Simulated Polygon overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Hexagon size={48} className="text-[#135bec]/20 fill-[#135bec]/10" strokeWidth={1} />
                </div>

                <Badge variant="outline" className="absolute top-3 right-3 bg-[hsl(var(--bg-secondary))]/90 backdrop-blur border-[hsl(var(--border-primary))] text-xs font-mono text-[hsl(var(--text-secondary))]">
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
                                <Link to={`/outposts/${outpost.uuid}`} className="flex items-center w-full">
                                    <ExternalLink size={14} className="mr-2" /> Open Details
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-[#282e39] cursor-pointer">
                                <Edit2 size={14} className="mr-2" /> Edit Geofence
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
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{outpost.created_at}</p>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[hsl(var(--border-primary))] flex items-center justify-between text-xs text-[hsl(var(--text-secondary))]">
                    <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        Active
                    </span>
                    <span>Updated 2h ago</span>
                </div>
            </CardContent>
        </Card>
    );
}