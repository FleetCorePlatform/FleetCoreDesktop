import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Mission } from "@/screens/common/types.ts";

interface MissionFeedProps {
    missions: Mission[];
    loading: boolean;
    count: number;
    onCountChange: (count: number) => void;
    onRefresh: () => void;
}

export function MissionFeed({
        missions,
        loading,
        count,
        onCountChange,
        onRefresh
    }: MissionFeedProps) {
    return (
        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 shrink-0">
                <div className="space-y-1">
                    <CardTitle className="text-lg">Recent Missions</CardTitle>
                    <CardDescription className="text-[hsl(var(--text-secondary))]">
                        Latest mission activity
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        min={1}
                        max={50}
                        className="w-16 h-8 text-right pr-2 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))]"
                        value={count}
                        onChange={(e) => onCountChange(parseInt(e.target.value) || 5)}
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))]"
                        onClick={onRefresh}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                {/* Scrollable Container */}
                <div className="space-y-3 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        Array.from({ length: count }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border-primary))]">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded" />
                            </div>
                        ))
                    ) : missions.length === 0 ? (
                        <div className="text-center py-8 text-[hsl(var(--text-secondary))] border border-dashed border-[hsl(var(--border-secondary))] rounded-lg">
                            <p className="text-sm">No missions found</p>
                        </div>
                    ) : (
                        missions.map((mission) => (
                            <div key={mission.missionUuid} className="flex items-center justify-between p-3 bg-[hsl(var(--bg-tertiary))] rounded-lg border border-[hsl(var(--border-primary))]">
                                <div className="flex-1">
                                    <p className="text-sm font-medium font-mono text-[hsl(var(--accent))]">
                                        {mission.name}
                                    </p>
                                    <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
                                        Launched: {new Date(mission.startTime).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                    Active
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}