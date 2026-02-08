import {
    ArrowLeft, Plus, Settings, Users, Box, MapPin, Search
} from 'lucide-react';
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {apiCall} from "@/utils/api.ts";
import {GroupSummary, OutpostSummary} from "@/models/Outpost.ts";

export default function OutpostOverviewScreen() {
    const { outpostUuid } = useParams<{ outpostUuid: string }>();
    const [outpost, setOutpost] = useState<OutpostSummary | null>(null);
    const [groups, setGroups] = useState<GroupSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let outpostOverview: OutpostSummary = await apiCall( `/api/v1/outposts/${outpostUuid}/summary`, undefined, "GET")

                setOutpost(outpostOverview);
                setGroups(outpostOverview.groups);

            } catch (error) {
                console.error("Failed to fetch outpost details", error);
            } finally {
                setLoading(false);
            }
        };

        if (outpostUuid) {
            fetchData();
        }
    }, [outpostUuid]);

    const filteredGroups = groups.filter(g =>
        g.groupName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="p-8 text-center text-[hsl(var(--text-secondary))]">Loading outpost details...</div>;
    }

    if (!outpost) {
        return <div className="p-8 text-center text-[hsl(var(--text-secondary))]">Outpost not found.</div>;
    }

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            <div className="flex-1 overflow-auto">
                <div className="max-w-[1400px] mx-auto p-4 lg:p-6 space-y-6">

                    {/* --- Header & Navigation --- */}
                    <div className="flex items-center gap-4">
                        <Link to="/outposts">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-secondary))]">
                                <ArrowLeft size={20} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{outpost.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))] mt-1 font-mono">
                                <MapPin size={14} />
                                {outpost.latitude.toFixed(4)}, {outpost.longitude.toFixed(4)}
                            </div>
                        </div>
                        <div className="ml-auto flex gap-2">
                            <Button variant="outline" className="h-9 border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]">
                                <Settings size={16} className="mr-2" />
                                Configure
                            </Button>
                            <Button className="bg-white text-black hover:bg-gray-200 h-9">
                                <Plus size={16} className="mr-2" />
                                New Group
                            </Button>
                        </div>
                    </div>

                    {/* --- Outpost Stats / Info --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Total Groups</p>
                                    <h3 className="text-2xl font-bold mt-1">{groups.length}</h3>
                                </div>
                                <div className="p-2 bg-[hsl(var(--bg-tertiary))] rounded-lg text-[#135bec]">
                                    <Users size={24} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Active Drones</p>
                                    <h3 className="text-2xl font-bold mt-1">
                                        {groups.reduce((acc, g) => acc + g.groupDroneCount, 0)}
                                    </h3>
                                </div>
                                <div className="p-2 bg-[hsl(var(--bg-tertiary))] rounded-lg text-emerald-400">
                                    <Box size={24} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                            <CardContent className="p-5">
                                <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase mb-2">Created At</p>
                                <p className="text-sm text-[hsl(var(--text-muted))] leading-relaxed">
                                    {outpost.createdAt}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- Groups List --- */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Assigned Groups</h2>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[hsl(var(--text-muted))]" />
                                <Input
                                    placeholder="Search groups..."
                                    className="pl-8 h-9 bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredGroups.map(group => (
                                <Card key={group.groupUUID} className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] hover:border-[hsl(var(--border-secondary))] transition-all">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-base font-medium">
                                            {group.groupName}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center text-sm text-[hsl(var(--text-muted))] mt-2">
                                            <Box size={16} className="mr-2" />
                                            {group.groupDroneCount} Drones Assigned
                                        </div>
                                        <div className="flex justify-end mt-4 gap-2">
                                            <Link to={`/missions/new/${group.groupUUID}`} state={{ groupData: outpost }}>
                                                <Button variant="outline" size="sm" className="text-xs h-7 border-[hsl(var(--border-primary))] text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50">
                                                    <Plus className="mr-1 h-3 w-3" /> New Mission
                                                </Button>
                                            </Link>
                                            <Link to={`/groups/${group.groupUUID}/${outpostUuid}`}>
                                                <Button variant="ghost" size="sm" className="text-xs h-7 text-[hsl(var(--text-secondary))] hover:text-white">
                                                    Manage Group <ArrowLeft className="ml-1 h-3 w-3 rotate-180" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {filteredGroups.length === 0 && (
                                <div className="col-span-full py-8 text-center text-[hsl(var(--text-secondary))] border border-dashed border-[hsl(var(--border-primary))] rounded-lg">
                                    No groups found matching your search.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}