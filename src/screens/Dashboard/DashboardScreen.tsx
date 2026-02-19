import { useState, useEffect, useCallback } from "react";
import { apiCall } from "@/utils/api";
import { useTheme } from "@/ThemeProvider";
import {MissionCountResponse} from "./types";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardStats } from "./components/DashboardStats";
import { MissionFeed } from "./components/MissionFeed";
import { OutpostMap } from "./components/OutpostMap";
import {Health, Mission, Outpost} from "@/screens/common/types.ts";

export default function DashboardScreen() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [outposts, setOutposts] = useState<Outpost[]>([]);
    const [health, setHealth] = useState<Health>();

    const [isSystemLoading, setIsSystemLoading] = useState(true);
    const [isMissionsLoading, setIsMissionsLoading] = useState(false);

    const [missionCount, setMissionCount] = useState(5);
    const [currentOutpostIndex, setCurrentOutpostIndex] = useState(0);

    const [sumMissionCount, setSumMissionCount] = useState<MissionCountResponse>({count: 0});

    const { theme } = useTheme();

    const fetchMissions = useCallback(async (count: number) => {
        setIsMissionsLoading(true);
        try {
            const missionCount = await apiCall<MissionCountResponse>("/api/v1/missions/count", undefined, "GET");

            const res = await apiCall<Mission[]>("/api/v1/missions", { "count": count }, "GET");
            const sorted = Array.isArray(res)
                ? res.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                : [];

            setSumMissionCount(missionCount)
            setMissions(sorted);
        } catch (error) {
            console.error("Error while fetching missions: ", error);
            setMissions([]);
        } finally {
            setIsMissionsLoading(false);
        }
    }, []);

    const fetchSystemData = useCallback(async () => {
        setIsSystemLoading(true);
        try {
            const [outpostsRes, healthRes] = await Promise.allSettled([
                apiCall<Outpost[]>('/api/v1/outposts', undefined, "GET"),
                apiCall<Health>('/q/health', undefined, "GET")
            ]);

            if (outpostsRes.status === 'fulfilled' && Array.isArray(outpostsRes.value)) {
                setOutposts(outpostsRes.value);
            } else {
                setOutposts([]);
            }

            if (healthRes.status === 'fulfilled') {
                setHealth(healthRes.value);
            } else {
                setHealth({ status: "DOWN", checks: [] });
            }

        } catch (error) {
            console.error('Failed to fetch system data:', error);
        } finally {
            setIsSystemLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSystemData();
        fetchMissions(5);
    }, [fetchSystemData, fetchMissions]);

    const handleMissionRefresh = () => {
        fetchMissions(missionCount);
    };

    const nextOutpost = () => {
        if (outposts.length === 0) return;
        setCurrentOutpostIndex((prev) => (prev + 1) % outposts.length);
    };

    const prevOutpost = () => {
        if (outposts.length === 0) return;
        setCurrentOutpostIndex((prev) => (prev - 1 + outposts.length) % outposts.length);
    };

    const isSystemHealthy = health?.status === 'UP';

    return (
        <div className="flex flex-col h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            <div className="flex-1 overflow-auto">
                <div className="max-w-[1400px] mx-auto p-4 lg:p-6 space-y-6 pb-20">
                    <DashboardHeader />

                    <DashboardStats
                        missionCount={sumMissionCount}
                        outposts={outposts}
                        loading={isSystemLoading}
                        health={health}
                        isSystemHealthy={isSystemHealthy}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <MissionFeed
                            missions={missions}
                            loading={isMissionsLoading}
                            count={missionCount}
                            onCountChange={setMissionCount}
                            onRefresh={handleMissionRefresh}
                        />
                        <OutpostMap
                            outposts={outposts}
                            currentOutpostIndex={currentOutpostIndex}
                            nextOutpost={nextOutpost}
                            prevOutpost={prevOutpost}
                            theme={theme}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}