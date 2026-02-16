import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import L from "leaflet";
import { Activity } from 'lucide-react';
import "leaflet/dist/leaflet.css";

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {GroupSummary, OutpostSummary} from "@/models/Outpost.ts";
import { useTheme } from "@/ThemeProvider.tsx";
import { MissionSidebar } from "./components/MissionSidebar";
import { MissionMap } from "./components/MissionMap";
import {apiCallFull} from "@/utils/api.ts";
import {CreateMissionRequest} from "@/screens/Mission/types.ts";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface OutpostData {
    uuid: string;
    name: string;
    latitude: number;
    longitude: number;
    boundary: Array<{ x: number; y: number }>;
}

export default function MissionCreationScreen() {
    const { outpostUuid } = useParams<{ outpostUuid: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const groupData: GroupSummary = location.state?.groupData;
    const outpostData: OutpostSummary = location.state?.outpostData;
    const [outpost, setOutpost] = useState<OutpostData | null>(null);

    const [loading, setLoading] = useState(true);
    const [jobName, setJobName] = useState("");
    const [missionAltitude, setMissionAltitude] = useState([50]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!outpostData || !groupData) {
                navigate('/outposts');
                return;
            }

            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 300));

            setOutpost({
                uuid: outpostUuid || "",
                name: outpostData.name,
                latitude: outpostData.latitude,
                longitude: outpostData.longitude,
                boundary: outpostData.area?.points || []
            });
            setLoading(false);
        };
        fetchData();
    }, [outpostUuid, outpostData, groupData, navigate]);

    const polygonPositions: L.LatLngExpression[] = useMemo(() => {
        if (!outpost?.boundary) return [];
        return outpost.boundary.map(p => [p.y, p.x] as [number, number]);
    }, [outpost]);

    const handleConfirmMission = async () => {
        if (!outpostData || !groupData) return;
        setIsSubmitting(true);

        const payload: CreateMissionRequest = {
            outpostUuid: outpostData.uuid,
            groupUuid: groupData.groupUUID,
            altitude: missionAltitude[0],
            jobName: jobName,
        }

        await apiCallFull("/api/v1/missions", undefined, "POST", payload)
            .then(res => {
                if (res.status === 200) {
                    navigate(`/missions/${groupData.groupUUID}`);
                }
            })
            .catch(e => console.error("Error while creating mission: ", e))
    };

    if (loading || !outpost) {
        return (
            <div className="flex h-screen items-center justify-center bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-secondary))] font-mono animate-pulse">
                <Activity className="animate-spin mr-2 h-5 w-5" />
                ACQUIRING TARGET DATA...
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            <div className="flex flex-1 relative overflow-hidden">

                {/* Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-[1400] lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <MissionSidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    outpost={outpost}
                    missionAltitude={missionAltitude}
                    jobName={jobName}
                    setMissionAltitude={setMissionAltitude}
                    setJobName={setJobName}
                    isSubmitting={isSubmitting}
                    handleConfirmMission={handleConfirmMission}
                    navigate={navigate}
                />

                <MissionMap
                    outpost={outpost}
                    theme={theme}
                    polygonPositions={polygonPositions}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
            </div>
        </div>
    );
}
