import {
    ArrowLeft, Plus, Settings, Battery, Signal,
    Trash2, AlertTriangle, Plane,
    Network, Server, Cpu, MapPin, RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {apiCall} from "@/utils/api.ts";

interface DroneSummaryModel {
    uuid: string,
    name: string
    group_name: string,
    address: string,
    manager_version: string,
    first_discovered: string,
    home_position: { x: number; y: number; z: number},
    maintenance: boolean,
    remaining_percent: number | null,
    inFlight: boolean
}

export default function GroupOverviewScreen() {
    const { groupUuid, outpostUuid } = useParams<{ groupUuid: string; outpostUuid: string; }>();
    const navigate = useNavigate();

    const [drones, setDrones] = useState<DroneSummaryModel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const dronesSummary: Array<DroneSummaryModel> = await apiCall(
                    `/api/v1/groups?group_uuid=${groupUuid}&limit=10`, undefined,
                    "GET"
                );
                setDrones(dronesSummary);

            } catch (error) {
                console.error("Failed to fetch group details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [groupUuid, outpostUuid]);

    const getBadgeColor = (status: DroneSummaryModel) => {
        if (!status.inFlight && status.maintenance) {
            return 'text-red-400 bg-red-400/10 border-red-400/20';
        }
        if (status.inFlight) {
            return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        }
        if (status.maintenance) {
            return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
        }
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    };

    const handleDeleteGroup = async () => {
        console.log(`Deleting group ${groupUuid}`);
        navigate(`/outposts/${outpostUuid}`);
    };

    if (loading) {
        return <div className="p-8 text-center text-[hsl(var(--text-secondary))]">Loading fleet data...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            <div className="flex-1 overflow-auto">
                <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">

                    {/* --- Header & Navigation --- */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={`/outposts/${outpostUuid}`}>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-secondary))]">
                                    <ArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold tracking-tight">{drones[1].name}</h1>
                                    <Badge variant="outline" className="text-[hsl(var(--text-muted))] border-[hsl(var(--border-primary))] font-mono">
                                        {(groupUuid || "").substring(0, 8)}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))] mt-1">
                                    <Server size={14} />
                                    <span>Assigned to Outpost: {(outpostUuid || "").substring(0, 8)}</span>
                                </div>
                            </div>
                        </div>

                        {/* UPDATED: Added flex-wrap and full width handling for mobile actions */}
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <Button variant="outline" className="flex-1 md:flex-none h-9 border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]">
                                <RefreshCw size={16} className="mr-2" />
                                Transfer Outpost
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={handleDeleteGroup}
                                className="flex-1 md:flex-none h-9 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                            >
                                <Trash2 size={16} className="mr-2" />
                                Delete Group
                            </Button>

                            <Button className="flex-1 md:flex-none bg-white text-black hover:bg-gray-200 h-9">
                                <Plus size={16} className="mr-2" />
                                Register Drone
                            </Button>
                        </div>
                    </div>

                    {/* --- KPI Cards --- */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Total Units</p>
                                    <h3 className="text-2xl font-bold mt-1">{drones.length}</h3>
                                </div>
                                <div className="p-2 bg-[hsl(var(--bg-tertiary))] rounded-lg text-white/70">
                                    <Plane size={20} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Available</p>
                                    <h3 className="text-2xl font-bold mt-1 text-emerald-400">
                                        {drones.filter(d => !d.maintenance).length}
                                    </h3>
                                </div>
                                <div className="p-2 bg-[hsl(var(--bg-tertiary))] rounded-lg text-emerald-400">
                                    <Signal size={20} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Firmware Version</p>
                                    <h3 className="text-lg font-bold mt-1 font-mono text-[hsl(var(--text-primary))]">{drones[0].manager_version}</h3>
                                </div>
                                <div className="p-2 bg-[hsl(var(--bg-tertiary))] rounded-lg text-blue-400">
                                    <Cpu size={20} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Maintenance</p>
                                    <h3 className="text-2xl font-bold mt-1 text-red-400">
                                        {drones.filter(d => d.maintenance).length}
                                    </h3>
                                </div>
                                <div className="p-2 bg-[hsl(var(--bg-tertiary))] rounded-lg text-red-400">
                                    <AlertTriangle size={20} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- Drone Roster --- */}
                    <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                        <CardHeader className="border-b border-[hsl(var(--border-primary))] pb-4">
                            {/* UPDATED: Changed layout to stack on mobile (flex-col) and fixed width issues */}
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <CardTitle className="text-lg font-medium">Fleet Registry</CardTitle>
                                    <CardDescription className="text-[hsl(var(--text-muted))]">
                                        Manage drone registration and telemetry.
                                    </CardDescription>
                                </div>
                                <Input
                                    placeholder="Filter by UUID or Name..."
                                    className="w-full md:w-64 h-9 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Note: Tables often need horizontal scroll on mobile. Ensure parent has overflow-auto if strict layout is required. */}
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-[hsl(var(--bg-tertiary))]">
                                        <TableRow className="hover:bg-transparent border-[hsl(var(--border-primary))]">
                                            <TableHead className="w-[200px]">Identity</TableHead>
                                            <TableHead>Network Address</TableHead>
                                            <TableHead>Firmware / Agent</TableHead>
                                            <TableHead>Home Position</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Battery</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {drones.map((drone) => (
                                            <TableRow key={drone.uuid} className="border-[hsl(var(--border-primary))] hover:bg-[hsl(var(--bg-tertiary))]/50">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-[hsl(var(--text-primary))]">{drone.name}</span>
                                                        <span className="text-xs font-mono text-[hsl(var(--text-muted))]">{drone.uuid.substring(0,8)}...</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm font-mono text-[hsl(var(--text-secondary))]">
                                                        <Network size={14} />
                                                        {drone.address}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[hsl(var(--text-muted))] w-8">Agent:</span>
                                                            <span className="font-mono text-[hsl(var(--text-secondary))]">{drone.manager_version}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {drone.home_position ? (
                                                        <div className="flex items-center gap-2 text-xs font-mono text-[hsl(var(--text-secondary))]">
                                                            <MapPin size={14} />
                                                            X:{drone.home_position.x}, Y:{drone.home_position.y}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-[hsl(var(--text-muted))] italic">Not Set</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={`capitalize font-normal border ${getBadgeColor(drone)}`}>
                                                        {drone.maintenance ? "Maintenance" : drone.inFlight ? "In Fligh" : "Ready"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="w-[150px]">
                                                    <div className="flex items-center gap-3">
                                                        <Battery size={16} className={drone.remaining_percent != null && drone.remaining_percent < 20 ? "text-red-400" : "text-[hsl(var(--text-secondary))]"} />
                                                        {drone.remaining_percent != null ? (
                                                            <>
                                                                <Progress value={drone.remaining_percent} className="h-1.5 w-full bg-[hsl(var(--bg-tertiary))]" />
                                                                <span className="text-xs font-mono w-8 text-right">{drone.remaining_percent}%</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs font-mono text-[hsl(var(--text-secondary))]">N/A</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]">
                                                            <Settings size={14} />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[hsl(var(--text-secondary))] hover:text-red-400 hover:bg-red-400/10">
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}