import {
  MapContainer,
  TileLayer,
  Polygon,
  useMapEvents,
  Polyline,
  CircleMarker,
} from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button.tsx';
import { PanelLeft } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { BaseMapProps, PointCoords } from '@/screens/Mission/types.ts';
import { MapController } from '@/screens/Mission/components/MissionMap.tsx';

export function SoloMissionController({
  waypoints,
  setWaypoints,
}: {
  waypoints: Array<PointCoords>;
  setWaypoints: (pts: Array<PointCoords>) => void;
}) {
  useMapEvents({
    click(e) {
      setWaypoints([...waypoints, { x: e.latlng.lng, y: e.latlng.lat }]);
    },
  });
  return null;
}

export interface SoloMissionMapProps extends BaseMapProps {
  soloWaypoints: Array<PointCoords>;
  setSoloWaypoints: (points: Array<PointCoords>) => void;
}

export function SoloMissionMap({
  outpost,
  theme,
  polygonPositions,
  sidebarOpen,
  setSidebarOpen,
  soloWaypoints,
  setSoloWaypoints,
}: SoloMissionMapProps) {
  return (
    <main className="flex-1 relative bg-[hsl(var(--bg-primary))]">
      <MapContainer
        center={[outpost.latitude, outpost.longitude]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        zoomControl={false}
      >
        {theme === 'light' ? (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&COPY OpenStreetMap"
          />
        ) : (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          />
        )}

        <MapController points={polygonPositions} />
        <SoloMissionController waypoints={soloWaypoints} setWaypoints={setSoloWaypoints} />

        <Polygon
          positions={polygonPositions}
          pathOptions={{
            color: '#64748b',
            fillOpacity: 0,
            weight: 2,
            dashArray: '5, 5',
          }}
        />

        {soloWaypoints.length > 0 && (
          <>
            <Polyline
              positions={soloWaypoints.map((pt) => [pt.y, pt.x] as L.LatLngExpression)}
              pathOptions={{ color: '#10b981', weight: 3 }}
            />
            {soloWaypoints.map((pt, idx) => (
              <CircleMarker
                key={idx}
                center={[pt.y, pt.x] as L.LatLngExpression}
                radius={5}
                pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 1 }}
              />
            ))}
          </>
        )}
      </MapContainer>

      <Button
        variant="secondary"
        size="icon"
        className={`absolute top-4 left-4 z-[1000] lg:hidden shadow-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={() => setSidebarOpen(true)}
      >
        <PanelLeft size={20} />
      </Button>

      <div className="hidden lg:block absolute top-6 right-6 z-[400] flex flex-col items-end gap-2 pointer-events-none">
        <div className="bg-[hsl(var(--bg-tertiary))]/95 backdrop-blur text-[hsl(var(--text-primary))] px-4 py-2 rounded-md border border-[hsl(var(--accent))]/30 shadow-xl">
          <span className="text-[10px] uppercase tracking-widest text-[hsl(var(--accent))] block mb-0.5">
            Mission Target
          </span>
          <span className="font-mono text-lg font-bold">{outpost.name}</span>
        </div>
      </div>
    </main>
  );
}
