import { Wifi, Server, Clock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Drone } from "../types";

interface DroneStatusGridProps {
    drone: Drone;
}

export function DroneStatusGrid({ drone }: DroneStatusGridProps) {
    const formatUptime = (timestamp: number | null, isConnected: boolean = true) => {
        if (!isConnected || !timestamp) return "OFFLINE";

        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 1000 / 60);
        const hours = Math.floor(minutes / 60);

        const days = Math.floor(hours / 24);
        const displayHours = hours % 24;
        const displayMinutes = minutes % 60;

        let result = "";
        if (days > 0) result += `${days}d `;
        if (displayHours > 0 || days > 0) result += `${displayHours}h `;
        result += `${displayMinutes}m`;

        return result;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                <CardContent className="p-4 flex flex-col gap-1">
                    <span className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Protocol</span>
                    <div className="flex items-center gap-2 mt-1">
                        <Wifi size={18} className="text-emerald-400" />
                        <span className="text-lg font-mono">MAVLink v2</span>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                <CardContent className="p-4 flex flex-col gap-1">
                    <span className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Agent Version</span>
                    <div className="flex items-center gap-2 mt-1">
                        <Server size={18} className="text-blue-400" />
                        <span className="text-lg font-mono">{drone.manager_version}</span>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                <CardContent className="p-4 flex flex-col gap-1">
                    <span className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Uptime</span>
                    <div className="flex items-start gap-3 mt-1">
                        <div className="mt-1">
                            {drone.status?.connected ? (
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                            ) : (
                                <Clock size={18} className="text-zinc-500" />
                            )}
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <span className={`text-lg font-mono leading-none ${drone.status?.connected ? "text-[hsl(var(--text-primary))]" : "text-zinc-500"}`}>
                                {formatUptime(drone.status?.uptime, drone.status?.connected)}
                            </span>

                            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">
                                {!drone.status?.uptime
                                    ? "Status: Never Seen"
                                    : drone.status.connected
                                        ? "Status: Uplink Active"
                                        : `Last Seen: ${new Date(drone.status.uptime).toLocaleString()}`
                                }
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
