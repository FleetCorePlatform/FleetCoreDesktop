import { MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Drone } from '../types';

interface DroneMapProps {
  drone: Drone;
  position: [number, number];
  theme: string;
}

export function DroneMap({ drone, position, theme }: DroneMapProps) {
  return (
    <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] flex flex-col h-[380px]">
      <CardHeader className="py-3 px-4 border-b border-[hsl(var(--border-primary))]">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MapPin size={16} className="text-[hsl(var(--text-secondary))]" />
          Current Location
        </CardTitle>
      </CardHeader>
      <div className="flex-1 relative z-0">
        <MapContainer
          center={position}
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
          <Marker position={position}>
            <Popup className="text-xs">{drone.address}</Popup>
          </Marker>
        </MapContainer>

        {/* Map Overlay Info */}
        <div className="absolute bottom-3 left-3 right-3 bg-[hsl(var(--bg-secondary))]/90 backdrop-blur border border-[hsl(var(--border-primary))] rounded-md p-2 z-[400] shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-[hsl(var(--text-secondary))] uppercase">
                Network Address
              </p>
              <p className="text-xs font-mono text-[hsl(var(--text-primary))] mt-0.5">
                {drone.address}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[hsl(var(--text-secondary))] uppercase">Coordinates</p>
              <p className="text-[10px] font-mono text-[hsl(var(--text-muted))] mt-0.5">
                {position[0].toFixed(5)}, {position[1].toFixed(5)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
