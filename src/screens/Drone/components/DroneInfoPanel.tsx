import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiCall } from '@/utils/api.ts';
import { useTheme } from '@/ThemeProvider.tsx';
import { Drone } from '@/screens/Drone/types';
import { DroneVisualizer } from '@/screens/Drone/components/DroneVisualizer';
import { DroneStatusGrid } from '@/screens/Drone/components/DroneStatusGrid';
import { DroneMap } from '@/screens/Drone/components/DroneMap';
import { DroneCapabilities } from '@/screens/Drone/components/DroneCapabilities';
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

export function DroneInfoPanel({ droneUuid }: { droneUuid: string }) {
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
    <div className="p-4 lg:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DroneVisualizer modelName={drone.model} isConsoleOpen={false} />
          <DroneStatusGrid drone={drone} />
        </div>
        <div className="space-y-6">
          <DroneMap
            drone={drone}
            position={[drone.home_position.y, drone.home_position.x]}
            theme={theme}
          />
          <DroneCapabilities drone={drone} />
        </div>
      </div>
    </div>
  );
}
