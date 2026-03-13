import { Wifi, Server, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {Drone, LiveTelemetryData} from '../types';
import {formatUptime} from "@/screens/Drone/utils/common.ts";

interface DroneStatusGridProps {
  drone: Drone;
  telemetry: LiveTelemetryData | null;
}

export function DroneStatusGrid({ drone, telemetry }: DroneStatusGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
        <CardContent className="p-4 flex flex-col gap-1">
          <span className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">
            Protocol
          </span>
          <div className="flex items-center gap-2 mt-1">
            <Wifi size={18} className="text-emerald-400" />
            <span className="text-lg font-mono">MAVLink v2</span>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
        <CardContent className="p-4 flex flex-col gap-1">
          <span className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">
            Agent Version
          </span>
          <div className="flex items-center gap-2 mt-1">
            <Server size={18} className="text-blue-400" />
            <span className="text-lg font-mono">{drone.manager_version}</span>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
        <CardContent className="p-4 flex flex-col gap-1">
          <span className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">
            Uptime
          </span>
          <div className="flex items-start gap-3 mt-1">
            <div className="mt-1">
              {telemetry?.uptime_s != null ? (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              ) : (
                <Clock size={18} className="text-zinc-500" />
              )}
            </div>

            <div className="flex flex-col gap-0.5">
              <span
                className={`text-lg font-mono leading-none ${telemetry?.uptime_s != null ? 'text-[hsl(var(--text-primary))]' : 'text-zinc-500'}`}
              >
                {telemetry ? formatUptime(telemetry.uptime_s) : 'OFFLINE'}
              </span>

              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">
                {!drone.status?.uptime
                  ? 'Status: Never Seen'
                  : drone.status.connected
                    ? 'Status: Uplink Active'
                    : `Last Seen: ${new Date(drone.status.uptime).toLocaleString()}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
