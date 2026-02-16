import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { apiCall } from "@/utils/api.ts";
import { useTheme } from "@/ThemeProvider.tsx";
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import { Drone } from "./types";
import { DroneHeader } from "./components/DroneHeader";
import { DroneVisualizer } from "./components/DroneVisualizer";
import { DroneStatusGrid } from "./components/DroneStatusGrid";
import { DroneMap } from "./components/DroneMap";
import { DroneCapabilities } from "./components/DroneCapabilities";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function DroneDetailsScreen() {
    const { droneUuid } = useParams<{ droneUuid: string }>();
    const navigate = useNavigate();

    const [drone, setDrone] = useState<Drone | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isConsoleOpen, setIsConsoleOpen] = useState(false);

    const { theme } = useTheme();

    useEffect(() => {
        if (!droneUuid) return;
        const fetchDrone = async () => {
            setLoading(true);
            try {
                const data = await apiCall<Drone>(`/api/v1/drones/${droneUuid}`, undefined, "GET");
                setDrone(data);
            } catch (e) {
                console.error("Error fetching drone:", e);
                setError("Failed to load drone telemetry.");
            } finally {
                setLoading(false);
            }
        };
        fetchDrone();
    }, [droneUuid]);

    if (loading) {
        return (
            <div className="h-screen w-full bg-[hsl(var(--bg-primary))] flex flex-col items-center justify-center gap-2 text-[hsl(var(--text-secondary))]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--text-primary))]"></div>
                <span className="font-mono text-sm animate-pulse">Establishing uplink...</span>
            </div>
        );
    }

    if (error || !drone) {
        return (
            <div className="h-screen w-full bg-[hsl(var(--bg-primary))] flex flex-col items-center justify-center gap-4 text-red-500">
                <AlertCircle size={48} />
                <p>{error || "Drone not found"}</p>
                <Button variant="outline" onClick={() => navigate(-1)}>Return to Fleet</Button>
            </div>
        );
    }

    const position: [number, number] = [drone.home_position.y, drone.home_position.x];

    return (
        <div className="pb-[4.5em] flex flex-col h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-mono overflow-hidden">
            <div className="flex-1 overflow-auto">
                <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">

                    <DroneHeader
                        drone={drone}
                        navigate={navigate}
                        isConsoleOpen={isConsoleOpen}
                        setIsConsoleOpen={setIsConsoleOpen}
                    />

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <DroneVisualizer modelName={drone.model} isConsoleOpen={isConsoleOpen} />
                            <DroneStatusGrid drone={drone} />
                        </div>

                        {/* Right Column (Map & Capabilities) */}
                        <div className="space-y-6">
                            <DroneMap drone={drone} position={position} theme={theme} />
                            <DroneCapabilities drone={drone} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
