import {
    ArrowLeft, Plus, Users, Box, MapPin, Search, AlertCircle, History, ArrowRight, Wrench, Drone
} from 'lucide-react';
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import {Link, useNavigate, useParams} from "react-router-dom";
import { useState, useEffect } from "react";
import { apiCall } from "@/utils/api.ts";
import { GroupSummary, OutpostSummary } from "@/models/Outpost.ts";

const GROUP_NAME_REGEX = /^[a-zA-Z0-9:_-]{1,128}$/;

export default function OutpostOverviewScreen() {
    const { outpostUuid } = useParams<{ outpostUuid: string }>();
    const [outpost, setOutpost] = useState<OutpostSummary | null>(null);
    const [groups, setGroups] = useState<GroupSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [groupNameError, setGroupNameError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let outpostOverview: OutpostSummary = await apiCall(`/api/v1/outposts/${outpostUuid}/summary`, undefined, "GET")

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

    const handleCreateGroup = async () => {
        if (!newGroupName) {
            setGroupNameError("Group name is required.");
            return;
        }
        if (!GROUP_NAME_REGEX.test(newGroupName)) {
            setGroupNameError("Invalid format. Use alphanumeric, '-', '_', or ':'. Max 128 chars.");
            return;
        }

        setIsCreating(true);
        setGroupNameError(null);

        const payload: CreateGroupBody = {
            // @ts-ignore
            outpost_uuid: outpost?.uuid,
            group_name: newGroupName,
        }

        await apiCall("/api/v1/groups", undefined, "POST", payload)
            .then(() => {
                setIsDialogOpen(false);
                setNewGroupName("");
            })
            .catch(e => {
                console.error("Failed to create group", e);
                setGroupNameError("Failed to create group. Please try again.");
            })
            .finally(() => {
                setIsCreating(false);
                navigate(0);
            });
    };

    const openDialog = () => {
        setNewGroupName("");
        setGroupNameError(null);
        setIsDialogOpen(true);
    };

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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link to="/outposts">
                                <Button variant="ghost" size="icon" className="h-9 w-9 -ml-2 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-secondary))]">
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
                        </div>

                        <div className="flex gap-2">
                            <Link to={`/maintenance/${outpostUuid}`}>
                                <Button variant="outline" className="bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] h-10 border-[hsl(var(--border-primary))]">
                                    <Wrench size={16} className="mr-2" />
                                    Maintenances
                                </Button>
                            </Link>

                            <Button
                                onClick={openDialog}
                                className="bg-white text-black hover:bg-gray-200 h-10 shadow-lg shadow-white/5"
                            >
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
                                    <Drone size={24} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                            <CardContent className="p-5">
                                <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase mb-2">Created At</p>
                                <p className="text-sm text-[hsl(var(--text-muted))] leading-relaxed">
                                    {new Date(outpost.createdAt).toLocaleDateString("en-US", {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                    })}
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
                                        <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                                            <Link to={`/missions/${group.groupUUID}`}>
                                                <Button variant="outline" size="sm" className="w-full text-xs h-7 border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-white hover:bg-[hsl(var(--bg-tertiary))]">
                                                    <History className="mr-1 h-3 w-3" /> Missions
                                                </Button>
                                            </Link>

                                            <Link to={`/missions/new/${group.groupUUID}`} state={{ groupData: outpost }}>
                                                <Button variant="outline" size="sm" className="w-full text-xs h-7 border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-white hover:bg-[hsl(var(--bg-tertiary))]">
                                                    <Plus className="mr-1 h-3 w-3" /> New Mission
                                                </Button>
                                            </Link>

                                            <Link to={`/groups/${group.groupUUID}/${outpostUuid}`} className="col-span-2">
                                                <Button variant="outline" size="sm" className="w-full text-xs h-7 border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-white hover:bg-[hsl(var(--bg-tertiary))]">
                                                    <ArrowRight className="mr-1 h-3 w-3" /> Manage Group
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Group</DialogTitle>
                        <DialogDescription className="text-[hsl(var(--text-secondary))]">
                            Establish a new drone fleet group for this outpost.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="outpost-name" className="text-[hsl(var(--text-secondary))]">
                                Assigned Outpost
                            </Label>
                            <Input
                                id="outpost-name"
                                value={outpost.name}
                                disabled
                                className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-muted))] opacity-70 cursor-not-allowed"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="group-name" className="text-[hsl(var(--text-secondary))]">
                                Group Name
                            </Label>
                            <Input
                                id="group-name"
                                value={newGroupName}
                                onChange={(e) => {
                                    setNewGroupName(e.target.value);
                                    if(groupNameError) setGroupNameError(null);
                                }}
                                placeholder="e.g. alpha-squad-01"
                                className={`bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] ${groupNameError ? 'border-red-500' : ''}`}
                            />
                            {groupNameError ? (
                                <div className="flex items-center gap-1 text-xs text-red-400 mt-1">
                                    <AlertCircle size={12} />
                                    <span>{groupNameError}</span>
                                </div>
                            ) : (
                                <p className="text-[10px] text-[hsl(var(--text-muted))]">
                                    Allowed: Alphanumeric, ':', '_', '-'. Max 128 chars.
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateGroup}
                            disabled={isCreating}
                            className="bg-white text-black hover:bg-gray-200"
                        >
                            {isCreating ? "Creating..." : "Create Group"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}