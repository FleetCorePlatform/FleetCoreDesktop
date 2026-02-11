import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft, CheckCircle2, Trash2, AlertTriangle,
    Clock, Wrench, Search, Filter, ShieldCheck, User, XCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiCall } from "@/utils/api.ts";

interface MaintenanceRecord {
    uuid: string;
    drone_uuid: string;
    drone_name: string;
    drone_group_name: string;
    performed_by: string;
    maintenance_type: string;
    description: string;
    created_at: string;
    performed_at?: string;
}

export default function MaintenanceScreen() {
    const { outpostUuid } = useParams<{ outpostUuid: string }>();

    const [records, setRecords] = useState<MaintenanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string | null>(null);

    useEffect(() => {
        if (!outpostUuid) return;

        setLoading(true);

        apiCall("/api/v1/maintenance", { "outpost_uuid": outpostUuid }, "GET", undefined)
            .then(res => setRecords(res))
            .catch(e => {
                console.error("Cannot fetch maintenances: ", e);
                setRecords([]);
            })
            .finally(() => {
                setLoading(false);
            })
    }, [outpostUuid]);

    const handleComplete = async (id: string) => {
        const now = new Date().toISOString();
        setRecords(prev => prev.map(r => {
            if (r.uuid === id) {
                return {
                    ...r,
                    performed_at: now,
                    performed_by: 'Pending Sync...'
                };
            }
            return r;
        }));

        try {
            await apiCall(`/api/v1/maintenance/${id}`, undefined, "PATCH");
        } catch (e) {
            console.error(`PATCH failed for ${id}`, e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this maintenance record?")) return;

        const previousRecords = [...records];
        setRecords(prev => prev.filter(r => r.uuid !== id));

        try {
            await apiCall(`/api/v1/maintenance/${id}`, undefined, "DELETE");
        } catch (e) {
            console.error(`DELETE failed for ${id}`, e);
            setRecords(previousRecords);
        }
    };

    const getTypeColor = (type: string) => {
        const t = type.toLowerCase();
        if (['hull', 'crash', 'damage', 'critical', 'fail', 'emergency', 'leak'].some(k => t.includes(k)))
            return "text-red-400 border-red-400/30 bg-red-400/10";
        if (['motor', 'rotor', 'propeller', 'repair', 'replace', 'battery', 'gear', 'servo'].some(k => t.includes(k)))
            return "text-orange-400 border-orange-400/30 bg-orange-400/10";
        if (['soft', 'firmware', 'patch', 'update', 'glitch', 'boot', 'os', 'ai', 'logic'].some(k => t.includes(k)))
            return "text-purple-400 border-purple-400/30 bg-purple-400/10";
        if (['sensor', 'lidar', 'calibration', 'cam', 'vision', 'optical', 'radar', 'gps'].some(k => t.includes(k)))
            return "text-blue-400 border-blue-400/30 bg-blue-400/10";
        if (['routine', 'check', 'inspect', 'clean', 'wash', 'log', 'standard'].some(k => t.includes(k)))
            return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
        return "text-slate-400 border-slate-400/30 bg-slate-400/10";
    };

    const availableTypes = Array.from(new Set(records.map(r => r.maintenance_type)));

    const filteredRecords = records.filter(r => {
        const matchesSearch = r.drone_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter ? r.maintenance_type === typeFilter : true;

        return matchesSearch && matchesType;
    });

    const pendingRecords = filteredRecords.filter(r => !r.performed_at);
    const historyRecords = filteredRecords.filter(r => r.performed_at);

    if (loading) {
        return <div className="p-8 text-center text-[hsl(var(--text-secondary))] font-mono">Loading maintenance logs...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            {/* --- Header --- */}
            <div className="border-b border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-secondary))] p-4 lg:px-8 lg:py-4">
                <div className="flex items-center gap-4">
                    <Link to={-1 as any}>
                        <Button variant="ghost" size="icon" className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <Wrench size={20} className="text-[hsl(var(--text-muted))]" />
                            Maintenance Console
                        </h1>
                    </div>
                </div>
            </div>

            {/* --- Controls --- */}
            <div className="flex-1 overflow-auto p-4 lg:p-8 max-w-6xl mx-auto w-full space-y-6">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-[hsl(var(--text-muted))]" />
                        <Input
                            placeholder="Search drone name or description..."
                            className="pl-8 h-9 bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {typeFilter && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTypeFilter(null)}
                                className="h-9 text-red-400 hover:text-red-300 hover:bg-red-400/10 mr-2"
                            >
                                <XCircle size={14} className="mr-2"/> Clear Filter
                            </Button>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))]">
                                    <Filter size={14} className="mr-2"/>
                                    {typeFilter ? typeFilter.replace('_', ' ') : "Filter Type"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                                <DropdownMenuItem onClick={() => setTypeFilter(null)}>
                                    All Types
                                </DropdownMenuItem>
                                {availableTypes.map(type => (
                                    <DropdownMenuItem key={type} onClick={() => setTypeFilter(type)}>
                                        {type.replace('_', ' ')}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* --- Tabs & Lists --- */}
                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-primary))] mb-6">
                        <TabsTrigger value="pending" className="data-[state=active]:bg-[hsl(var(--bg-tertiary))]">
                            <AlertTriangle size={14} className="mr-2" /> Pending ({pendingRecords.length})
                        </TabsTrigger>
                        <TabsTrigger value="history" className="data-[state=active]:bg-[hsl(var(--bg-tertiary))]">
                            <ShieldCheck size={14} className="mr-2" /> History ({historyRecords.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* --- PENDING TAB --- */}
                    <TabsContent value="pending" className="space-y-4">
                        {pendingRecords.length === 0 && (
                            <div className="text-center py-12 border border-dashed border-[hsl(var(--border-primary))] rounded-lg text-[hsl(var(--text-secondary))]">
                                {typeFilter ? "No active requests match this filter." : "No active maintenance requests."}
                            </div>
                        )}
                        {pendingRecords.map(record => (
                            <Card key={record.uuid} className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] hover:border-[hsl(var(--border-secondary))] transition-all group">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`${getTypeColor(record.maintenance_type)}`}>
                                                    {record.maintenance_type.replace('_', ' ')}
                                                </Badge>
                                                <span className="text-sm font-mono text-[hsl(var(--text-muted))]">
                                                    {record.drone_name}
                                                </span>
                                            </div>
                                            <CardTitle className="text-base font-medium pt-1">
                                                {record.description}
                                            </CardTitle>
                                        </div>
                                        <div className="text-xs text-[hsl(var(--text-muted))] font-mono flex items-center bg-[hsl(var(--bg-primary))] px-2 py-1 rounded">
                                            {record.drone_group_name}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="flex items-center gap-2 text-xs text-[hsl(var(--text-secondary))] mt-2">
                                        <Clock size={12} />
                                        Created: {new Date(record.created_at).toLocaleString()}
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2 flex justify-end gap-2 border-t border-[hsl(var(--border-primary))] mt-2 bg-[hsl(var(--bg-tertiary))]/30">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(record.uuid)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8"
                                    >
                                        <Trash2 size={14} className="mr-1.5"/> Dismiss
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleComplete(record.uuid)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white h-8"
                                    >
                                        <CheckCircle2 size={14} className="mr-1.5"/> Mark Complete
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </TabsContent>

                    {/* --- HISTORY TAB --- */}
                    <TabsContent value="history" className="space-y-4">
                        {historyRecords.length === 0 && (
                            <div className="text-center py-12 border border-dashed border-[hsl(var(--border-primary))] rounded-lg text-[hsl(var(--text-secondary))]">
                                No maintenance history found.
                            </div>
                        )}
                        {historyRecords.map(record => (
                            <Card key={record.uuid} className="bg-[hsl(var(--bg-secondary))]/50 border-[hsl(var(--border-primary))] opacity-80 hover:opacity-100 transition-opacity">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-[hsl(var(--text-muted))] border-[hsl(var(--border-primary))]">
                                                    {record.maintenance_type.replace('_', ' ')}
                                                </Badge>
                                                <span className="text-sm font-mono text-[hsl(var(--text-muted))] line-through decoration-zinc-500">
                                                    {record.drone_name}
                                                </span>
                                            </div>
                                            <CardTitle className="text-base font-medium pt-1 text-[hsl(var(--text-secondary))]">
                                                {record.description}
                                            </CardTitle>
                                        </div>
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-0">
                                            COMPLETED
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 p-3 bg-[hsl(var(--bg-tertiary))] rounded text-xs text-[hsl(var(--text-secondary))]">
                                        <div className="flex items-center gap-2">
                                            <User size={12} />
                                            <span>Coordinator: <span className="font-mono text-[hsl(var(--text-secondary))]">{record.performed_by}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={12} />
                                            <span>Completed at: {new Date(record.performed_at!).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}