import { Shield, Navigation, Camera, Thermometer, Wifi, Cpu, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Drone } from "../types";

interface DroneCapabilitiesProps {
    drone: Drone;
}

export function DroneCapabilities({ drone }: DroneCapabilitiesProps) {
    const getCapabilityIcon = (cap: string) => {
        const c = cap.toLowerCase();
        if (c.includes('gps') || c.includes('rtk')) return Navigation;
        if (c.includes('camera') || c.includes('optic')) return Camera;
        if (c.includes('thermal')) return Thermometer;
        if (c.includes('avoid') || c.includes('lidar')) return Shield;
        if (c.includes('wifi') || c.includes('telemetry')) return Wifi;
        if (c.includes('compute') || c.includes('pi')) return Cpu;
        return Zap;
    };

    return (
        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
            <CardHeader className="py-3 px-4 border-b border-[hsl(var(--border-primary))]">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield size={16} className="text-[hsl(var(--text-secondary))]" />
                    Registered Capabilities
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="max-h-[300px] overflow-y-auto">
                    {drone.capabilities && drone.capabilities.length > 0 ? (
                        <div className="divide-y divide-[hsl(var(--border-primary))]">
                            {drone.capabilities.map((cap, i) => {
                                const Icon = getCapabilityIcon(cap);
                                return (
                                    <div key={i} className="flex items-center justify-between p-3 hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))]">
                                                <Icon size={14} />
                                            </div>
                                            <span className="text-sm font-medium text-[hsl(var(--text-secondary))] capitalize">{cap}</span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] border-[hsl(var(--border-primary))] text-[hsl(var(--text-muted))]">
                                            INSTALLED
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-sm text-[hsl(var(--text-muted))] italic">
                            No capabilities advertised
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="py-3 px-4 bg-[hsl(var(--bg-tertiary))] border-t border-[hsl(var(--border-primary))]">
                <p className="text-[10px] text-[hsl(var(--text-muted))] w-full text-center">
                    Registered Date: {new Date(drone.first_discovered).toLocaleDateString()}
                </p>
            </CardFooter>
        </Card>
    );
}
