import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { PanelLeft } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { OutpostSummary } from '@/screens/common/types.ts';

function MapController({ points }: { points: L.LatLngExpression[] }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.polygon(points).getBounds();
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
    }
  }, [points, map]);
  return null;
}

interface MissionMapProps {
  outpost: OutpostSummary;
  theme: string;
  polygonPositions: L.LatLngExpression[];
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function MissionMap({
  outpost,
  theme,
  polygonPositions,
  sidebarOpen,
  setSidebarOpen,
}: MissionMapProps) {
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

        <Polygon
          positions={polygonPositions}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '10, 5',
          }}
        />
      </MapContainer>

      {/* Mobile Menu Toggle */}
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

      {/* Desktop HUD Overlay */}
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
