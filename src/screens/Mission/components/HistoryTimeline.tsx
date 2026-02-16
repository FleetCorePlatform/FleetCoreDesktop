import MissionItem from "@/screens/Mission/components/MissionItem.tsx";
import { Mission } from "@/screens/Mission/types";

interface HistoryTimelineProps {
    isLoading: boolean;
    missions: Mission[];
    groupUuid: string;
    formatDate: (iso: string) => string;
    formatTime: (iso: string) => string;
    getDuration: (start: string | number, end?: string | number) => string;
}

export function HistoryTimeline({
    isLoading,
    missions,
    groupUuid,
    formatDate,
    formatTime,
    getDuration
}: HistoryTimelineProps) {
    return (
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
    );
}
