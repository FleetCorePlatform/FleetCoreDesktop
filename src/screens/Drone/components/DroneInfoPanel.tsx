import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiCall } from '@/utils/api.ts';
import { useTheme } from '@/ThemeProvider.tsx';
import { Drone, LiveTelemetryData } from '@/screens/Drone/types';
import { DroneVisualizer } from '@/screens/Drone/components/DroneVisualizer';
import { DroneStatusGrid } from '@/screens/Drone/components/DroneStatusGrid';
import { DroneMap } from '@/screens/Drone/components/DroneMap';
import { DroneCapabilities } from '@/screens/Drone/components/DroneCapabilities';
import { TelemetryChart } from '@/screens/Drone/components/TelemetryChart.tsx';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface DroneInfoPanelProps {
  droneUuid: string;
  telemetry: LiveTelemetryData | null;
  telemetryHistory: { timestamp: number; data: LiveTelemetryData }[];
}

export function DroneInfoPanel({ droneUuid, telemetry, telemetryHistory }: DroneInfoPanelProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [drone, setDrone] = useState<Drone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await apiCall<Drone>(`/api/v1/drones/${droneUuid}`, undefined, 'GET');
        setDrone(data);
      } catch (e) {
        setError('Failed to load drone telemetry.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [droneUuid]);

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-[hsl(var(--text-secondary))]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--text-primary))]" />
          <span className="font-mono text-sm animate-pulse">Fetching drone data...</span>
        </div>
    );
  }

  if (error || !drone) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-red-500">
          <AlertCircle size={48} />
          <p className="font-mono text-sm">{error || 'Drone not found'}</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Return to Fleet
          </Button>
        </div>
    );
  }

  return (
      <div className="lg:h-full lg:overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-full">

          {/* Left: Visualizer + Charts */}
          <div className="lg:col-span-2 flex flex-col gap-6 lg:min-h-0 lg:h-full">
            <div className="lg:shrink-0">
              <DroneVisualizer modelName={drone.model} isConsoleOpen={false} />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-[#3b4354] scrollbar-track-transparent border rounded-lg bg-[hsl(var(--bg-secondary))]/50 border-[hsl(var(--border-primary))]">
              <TelemetryChart
                  title="Battery — Last 30s"
                  data={telemetryHistory}
                  dataKey="data.battery.remaining_percent"
                  unit="%"
                  domain={[0, 100]}
              />

              <div className="h-px bg-[hsl(var(--border-primary))]" />

              <TelemetryChart
                  title="Signal Strength"
                  data={telemetryHistory}
                  dataKey="data.signal_strength_dbm"
                  unit=" dBm"
                  color="#6366f1"
                  domain={[-100, 0]}
              />

              <div className="h-px bg-[hsl(var(--border-primary))]" />

              <TelemetryChart
                  title="Ground Speed"
                  data={telemetryHistory}
                  dataKey="data.velocity.ground_speed_ms"
                  unit=" m/s"
                  color="#f59e0b"
              />
            </div>
          </div>

          {/* Right: Map + Status + Capabilities */}
          <div className="space-y-6 lg:overflow-y-auto scrollbar-thin scrollbar-thumb-[#3b4354] scrollbar-track-transparent">
            <DroneMap
                drone={drone}
                homePosition={[drone.home_position.y, drone.home_position.x]}
                livePosition={telemetry ? [telemetry.position.latitude_deg, telemetry.position.longitude_deg] : undefined}
                theme={theme}
            />
            <DroneStatusGrid drone={drone} />
            <DroneCapabilities drone={drone} />
          </div>

        </div>
      </div>
  );
}