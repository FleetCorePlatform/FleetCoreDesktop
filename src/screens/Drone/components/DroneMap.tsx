import { MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {MapContainer, TileLayer, Marker, Popup, Polyline} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Drone } from '../types';

interface DroneMapProps {
  drone: Drone;
  homePosition: [number, number];
  livePosition?: [number, number];
  theme: string;
}

export function DroneMap({ drone, homePosition, livePosition, theme }: DroneMapProps) {
  return (
    <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] flex flex-col h-[380px]">
      <CardHeader className="py-3 px-4 border-b border-[hsl(var(--border-primary))]">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MapPin size={16} className="text-[hsl(var(--text-secondary))]" />
          Home Position
        </CardTitle>
      </CardHeader>
      <div className="flex-1 relative z-0">
        <MapContainer
          center={homePosition}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          {theme == 'light' ? (
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
          {livePosition && (
              <>
                <Marker position={livePosition} />
                <Polyline
                    positions={[homePosition, livePosition]}
                    pathOptions={{
                      color: '#6b7280',
                      weight: 1.5,
                      dashArray: '6, 6',
                      opacity: 0.6,
                    }}
                />
              </>
          )}

          <Marker position={homePosition}>
            <Popup className="text-xs">{drone.address}</Popup>
          </Marker>
        </MapContainer>

        {/* Map Overlay Info */}
        <div className="absolute bottom-3 left-3 right-3 bg-[hsl(var(--bg-secondary))]/90 backdrop-blur border border-[hsl(var(--border-primary))] rounded-md p-2 z-[400] shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-[hsl(var(--text-secondary))] uppercase">
                Public Address
              </p>
              <p className="text-xs font-mono text-[hsl(var(--text-primary))] mt-0.5">
                {drone.address}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[hsl(var(--text-secondary))] uppercase">Home Coordinates</p>
              <p className="text-[10px] font-mono text-[hsl(var(--text-muted))] mt-0.5">
                {homePosition[0].toFixed(5)}, {homePosition[1].toFixed(5)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
