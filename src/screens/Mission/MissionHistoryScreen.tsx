import { Button } from "@/components/ui/button.tsx";
import { ArrowLeft } from "lucide-react";
import { apiCall } from "@/utils/api.ts";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Mission } from "@/screens/Mission/types.ts";
import MissionItem from "@/screens/Mission/components/MissionItem.tsx";

export default function MissionHistoryScreen() {
    const { groupUuid } = useParams<{ groupUuid: string }>();
    const navigate = useNavigate();

    const [missions, setMissions] = useState<Mission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMissions = async () => {
            setIsLoading(true);
            await apiCall<Mission[]>("/api/v1/missions", { "group_uuid": groupUuid || "" }, "GET")
                .then(res => {
                    const sorted = res.sort((a, b) =>
                        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
                    );
                    setMissions(sorted);
                }).catch(e => {
                    console.log("Error while fetching missions: ", e);
                    setMissions([])
                }).finally(() => setIsLoading(false))
        };

        fetchMissions();
    }, [groupUuid]);

    const getDuration = (start: string | number, end?: string | number) => {
        const startDate = new Date(start);
        const endDate = end ? new Date(end) : new Date();

        if (isNaN(startDate.getTime())) return "--";

        const diffMs = endDate.getTime() - startDate.getTime();
        const totalMins = Math.floor(diffMs / 60000);

        if (totalMins < 0) return "--";
        if (totalMins < 60) {
            return `${totalMins}m`;
        }

        if (totalMins < 1440) {
            const hours = Math.floor(totalMins / 60);
            const mins = totalMins % 60;
            return `${hours}h ${mins}m`;
        }

        const days = Math.floor(totalMins / 1440);
        const hours = Math.floor((totalMins % 1440) / 60);
        return `${days}d ${hours}h`;
    };

    const formatTime = (isoString: string) => {
        if (!isoString) return "--:--";
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const totalThreats = missions.reduce((acc, curr) => acc + curr.detectionCount, 0);

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

                <div className="grid grid-cols-2 gap-3 mb-4">
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
                </div>
            </div>

            {/* --- Timeline Content --- */}
            <div className="flex-1 overflow-y-auto px-6 pt-10 pb-6 relative">
                {isLoading ? (
                    <div className="flex justify-center pt-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--accent))]"></div>
                    </div>
                ) : (
                    <div className="relative border-l border-[hsl(var(--border-primary))] ml-3.5 space-y-4 pb-10">
                        {missions.map((mission, index) => {
                            const showDateHeader = index === 0 ||
                                new Date(missions[index - 1].startTime).getDate() !== new Date(mission.startTime).getDate();

                            return (
                                <div key={mission.missionUuid}>
                                    {showDateHeader && (
                                        <div className="pl-8 text-xs font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider mb-4 mt-2">
                                            {formatDate(mission.startTime)}
                                        </div>
                                    )}
                                    <MissionItem
                                        mission={mission}
                                        groupUuid={groupUuid || ""}
                                        formatDate={formatDate}
                                        formatTime={formatTime}
                                        getDuration={getDuration}
                                    />
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