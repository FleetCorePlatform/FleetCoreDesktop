import { DroneSummaryModel } from "../types";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Drone, Signal, Cpu, AlertTriangle } from 'lucide-react';

interface GroupStatsProps {
    drones: DroneSummaryModel[];
    firmwareVersion: string;
}

export function GroupStats({ drones, firmwareVersion }: GroupStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Total Units</p>
                        <h3 className="text-2xl font-bold mt-1">{drones.length}</h3>
                    </div>
                    <div className="p-2 bg-[hsl(var(--bg-tertiary))] rounded-lg text-white/70">
                        <Drone size={20} />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Available</p>
                        <h3 className="text-2xl font-bold mt-1 text-emerald-400">
                            {drones.filter(d => !d.maintenance).length}
                        </h3>
                    </div>
                    <div className="p-2 bg-[hsl(var(--bg-tertiary))] rounded-lg text-emerald-400">
                        <Signal size={20} />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Firmware Version</p>
                        <h3 className="text-lg font-bold mt-1 font-mono text-[hsl(var(--text-primary))]">{firmwareVersion}</h3>
                    </div>
                    <div className="p-2 bg-[hsl(var(--bg-tertiary))] rounded-lg text-blue-400">
                        <Cpu size={20} />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Maintenance</p>
                        <h3 className="text-2xl font-bold mt-1 text-red-400">
                            {drones.filter(d => d.maintenance).length}
                        </h3>
                    </div>
                    <div className="p-2 bg-[hsl(var(--bg-tertiary))] rounded-lg text-red-400">
                        <AlertTriangle size={20} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
