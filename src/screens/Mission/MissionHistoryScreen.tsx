import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Clock, ChevronRight,
    ShieldCheck, Timer
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface Mission {
    missionUUID: string;
    name: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'PENDING' | 'ABORTED';
    startTime: string;
    endTime?: string;
    detectionCount: number;
}

export default function MissionHistoryScreen() {
    const { groupUuid } = useParams<{ groupUuid: string }>();
    const navigate = useNavigate();

    const [missions, setMissions] = useState<Mission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMissions = async () => {
            setIsLoading(true);

            // TODO: Change mock to API fetched data
            const mockData: Mission[] = [
                {
                    missionUUID: "mis-gamma-003",
                    name: "Active Response",
                    status: 'IN_PROGRESS',
                    startTime: new Date().toISOString(),
                    detectionCount: 1
                },
                {
                    missionUUID: "mis-alpha-001",
                    name: "Sector 7 Night Sweep",
                    status: 'COMPLETED',
                    startTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                    endTime: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
                    detectionCount: 5
                },
                {
                    missionUUID: "mis-beta-002",
                    name: "Routine Perimeter Check",
                    status: 'COMPLETED',
                    startTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                    endTime: new Date(Date.now() - 1000 * 60 * 60 * 23.5).toISOString(),
                    detectionCount: 0
                },
                {
                    missionUUID: "mis-delta-004",
                    name: "Aborted Patrol",
                    status: 'ABORTED',
                    startTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
                    endTime: new Date(Date.now() - 1000 * 60 * 60 * 47.9).toISOString(),
                    detectionCount: 0
                },
            ];

            setTimeout(() => {
                const sorted = mockData.sort((a, b) =>
                    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
                );
                setMissions(sorted);
                setIsLoading(false);
            }, 600);
        };

        fetchMissions();
    }, [groupUuid]);

    const getDuration = (start: string, end?: string) => {
        if (!end) return "Ongoing";
        const diffMs = new Date(end).getTime() - new Date(start).getTime();
        const mins = Math.round(diffMs / 60000);
        return `${mins} min`;
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const totalThreats = missions.reduce((acc, curr) => acc + curr.detectionCount, 0);
    const activeMission = missions.find(m => m.status === 'IN_PROGRESS');

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] relative overflow-hidden">

            {/* --- Header Section --- */}
            <div className="flex-none p-6 pb-2 z-10 bg-[hsl(var(--bg-primary))] border-b border-[hsl(var(--border-primary))]">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Mission Log</h1>
                        <p className="text-xs text-[hsl(var(--text-secondary))] uppercase tracking-widest font-mono mt-1">
                            Group {groupUuid?.substring(0, 8)}
                        </p>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-[hsl(var(--bg-secondary))] p-3 rounded-lg border border-[hsl(var(--border-primary))]">
                        <div className="text-[10px] text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">Total Sorties</div>
                        <div className="text-xl font-bold font-mono">{missions.length}</div>
                    </div>
                    <div className="bg-[hsl(var(--bg-secondary))] p-3 rounded-lg border border-[hsl(var(--border-primary))]">
                        <div className="text-[10px] text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">Total Threats</div>
                        <div className={`text-xl font-bold font-mono ${totalThreats > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {totalThreats}
                        </div>
                    </div>
                    <div className="bg-[hsl(var(--bg-secondary))] p-3 rounded-lg border border-[hsl(var(--border-primary))] col-span-2 sm:col-span-1">
                        <div className="text-[10px] text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">Status</div>
                        <div className="text-xl font-bold font-mono flex items-center gap-2">
                            {activeMission ? (
                                <><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span> Active</>
                            ) : (
                                <><span className="h-2 w-2 rounded-full bg-gray-500"></span> Idle</>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Timeline Content --- */}
            <div className="flex-1 overflow-y-auto px-6 pt-10 pb-6 relative">
                {isLoading ? (
                    <div className="flex justify-center pt-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--accent))]"></div>
                    </div>
                ) : (
                    <div className="relative border-l border-[hsl(var(--border-primary))] ml-3.5 space-y-8 pb-10">
                        {missions.map((mission, index) => {
                            const hasThreats = mission.detectionCount > 0;
                            const isLive = mission.status === 'IN_PROGRESS';

                            const showDateHeader = index === 0 ||
                                new Date(missions[index - 1].startTime).getDate() !== new Date(mission.startTime).getDate();

                            return (
                                <div key={mission.missionUUID} className="relative pl-8 group">
                                    {/* Timeline Node */}
                                    <div className={`absolute -left-[5px] top-6 h-2.5 w-2.5 rounded-full border-2 border-[hsl(var(--bg-primary))] z-10 transition-colors duration-300
                                        ${isLive ? 'bg-blue-500 animate-pulse ring-4 ring-blue-500/20' :
                                        hasThreats ? 'bg-red-500 ring-4 ring-red-500/10' :
                                            'bg-emerald-500/50'}`}
                                    />

                                    {/* Date Header */}
                                    {showDateHeader && (
                                        <div className="absolute -top-6 left-8 text-xs font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider mb-2">
                                            {formatDate(mission.startTime)}
                                        </div>
                                    )}

                                    {/* Card */}
                                    <div className={`rounded-xl border transition-all duration-200 overflow-hidden
                                        ${hasThreats
                                        ? 'bg-red-950/5 border-red-500/30 hover:border-red-500/50'
                                        : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] hover:border-[hsl(var(--accent))]'
                                    }`}
                                    >
                                        <div className="flex flex-col sm:flex-row">

                                            {/* Left: Info */}
                                            <div className="p-4 flex-1">
                                                {/* Header Row: Name + Badge */}
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="min-w-0">
                                                        <h3 className={`font-bold text-sm truncate ${hasThreats ? 'text-red-100' : 'text-[hsl(var(--text-primary))]'}`}>
                                                            {mission.name || "Untitled Operation"}
                                                        </h3>
                                                    </div>

                                                    <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                                        mission.status === 'COMPLETED' ? 'text-emerald-500 bg-emerald-500/10' :
                                                            mission.status === 'IN_PROGRESS' ? 'text-blue-500 bg-blue-500/10' :
                                                                'text-gray-400 bg-gray-500/10'
                                                    }`}>
                                                        {mission.status}
                                                    </span>
                                                </div>

                                                {/* Time Row */}
                                                <div className="flex items-center justify-between sm:justify-start sm:gap-4 mt-2 text-xs text-[hsl(var(--text-secondary))]">
                                                    <span className="flex items-center gap-1 bg-[hsl(var(--bg-tertiary))] px-2 py-0.5 rounded text-[10px] font-mono border border-[hsl(var(--border-primary))]">
                                                        <Clock size={10} />
                                                        {formatTime(mission.startTime)}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[hsl(var(--text-muted))]">
                                                        <Timer size={10} />
                                                        {getDuration(mission.startTime, mission.endTime)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Right: Metrics & Action */}
                                            <div className={`p-4 sm:w-40 flex flex-col justify-center border-t sm:border-t-0 sm:border-l ${hasThreats ? 'border-red-500/20 bg-red-500/5' : 'border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-tertiary))]'}`}>

                                                {/* Metric */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[10px] uppercase font-bold text-[hsl(var(--text-secondary))]">Detections</span>
                                                    <span className={`text-lg font-mono font-bold ${hasThreats ? 'text-red-500' : 'text-[hsl(var(--text-muted))]'}`}>
                                                        {mission.detectionCount}
                                                    </span>
                                                </div>

                                                {/* Action Button */}
                                                {hasThreats ? (
                                                    <Link to={`/detections/${groupUuid}/${mission.missionUUID}`}>
                                                        <Button
                                                            size="sm"
                                                            className="w-full h-7 text-xs bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:text-red-300 shadow-none"
                                                        >
                                                            Review <ChevronRight size={12} className="ml-1 opacity-70" />
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <div className="h-7 flex items-center justify-center text-[10px] text-emerald-500/50 font-medium uppercase tracking-widest gap-1">
                                                        <ShieldCheck size={12} /> Clear
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="pl-8 pt-4 pb-7 opacity-50">
                            <div className="flex items-center gap-2 text-xs text-[hsl(var(--text-muted))]">
                                <div className="h-2 w-2 rounded-full bg-[hsl(var(--border-primary))]"></div>
                                End of history
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}