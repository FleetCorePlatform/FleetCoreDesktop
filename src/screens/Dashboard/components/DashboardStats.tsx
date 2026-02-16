import { Activity, MapPin, TrendingUp, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import {MissionCountResponse, Outpost} from "../types";
import {Health} from "@/screens/common/types.ts";

interface DashboardStatsProps {
    missionCount: MissionCountResponse;
    outposts: Outpost[];
    loading: boolean;
    health?: Health;
    isSystemHealthy: boolean;
}

export function DashboardStats({ missionCount, outposts, loading, health, isSystemHealthy }: DashboardStatsProps) {
    const statusColor = isSystemHealthy ? 'text-emerald-400' : 'text-red-400';
    const StatusIcon = isSystemHealthy ? CheckCircle : AlertCircle;

    return (
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
                                        {missionCount ? missionCount.count : 0}
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
                    <TooltipContent className="z-500 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] p-0 shadow-xl w-[370px]">
                        <div className="p-3 border-b border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-tertiary))]/50">
                            <p className="text-xs font-semibold text-[hsl(var(--text-secondary))]">Service Health Checks</p>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {health?.checks && health.checks.length > 0 ? (
                                health.checks.map((check, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-4 text-sm">
                                        <span className="font-medium truncate" title={check.name}>{check.name}</span>
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
    );
}
