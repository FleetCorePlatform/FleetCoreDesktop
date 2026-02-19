import { useState } from 'react';
import {
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ScanLine,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Detection } from '@/screens/Mission/types';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface DetectionReviewDialogProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  selectedDetection: Detection | null;
  sendDetectionConfirmation: (uuid: string, isFalsePositive: boolean) => void;
  theme: string;
}

export function DetectionReviewDialog({
  isModalOpen,
  setIsModalOpen,
  selectedDetection,
  sendDetectionConfirmation,
  theme,
}: DetectionReviewDialogProps) {
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const formatCoords = (lat: number, lng: number) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

  const toggleMap = () => setIsMapExpanded(!isMapExpanded);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] md:h-[85vh] p-0 gap-0 bg-[hsl(var(--bg-primary))] border-[hsl(var(--border-primary))] flex flex-col overflow-hidden font-mono focus:outline-none">
        {selectedDetection && (
          <>
            {/* --- Modal Header --- */}
            <DialogHeader className="px-4 py-3 md:px-6 md:py-4 border-b border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-secondary))] flex-none z-20">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-3 md:gap-4">
                  <div
                    className={`p-2 rounded border flex-none mt-0.5 ${
                      selectedDetection.false_positive === false
                        ? 'bg-red-500/10 border-red-500/20'
                        : 'bg-green-500/10 border-green-500/20'
                    }`}
                  >
                    {selectedDetection.false_positive === false ? (
                      <AlertTriangle size={20} className="text-red-500" />
                    ) : (
                      <CheckCircle2 size={20} className="text-green-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                      <DialogTitle className="text-base md:text-lg font-bold uppercase tracking-wide truncate">
                        Target: {selectedDetection.object}
                      </DialogTitle>
                      <Badge
                        variant="outline"
                        className={`flex-none h-5 md:h-6 text-[10px] md:text-xs border px-1.5 md:px-2.5 ${
                          selectedDetection.confidence >= 0.8
                            ? 'text-red-600 border-red-600/30 bg-red-600/10'
                            : selectedDetection.confidence >= 0.5
                              ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10'
                              : 'text-gray-500 border-gray-500/30 bg-gray-500/10'
                        }`}
                      >
                        {(selectedDetection.confidence * 100).toFixed(1)}% CONFIDENCE
                      </Badge>
                    </div>

                    <DialogDescription className="font-mono text-[10px] md:text-xs text-[hsl(var(--text-secondary))] mt-1.5 md:mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span className="truncate max-w-[150px] md:max-w-none">
                        ID: {selectedDetection.uuid}
                      </span>
                      <span className="hidden md:inline">|</span>
                      <span>T: {new Date(selectedDetection.detected_at).toLocaleTimeString()}</span>
                    </DialogDescription>
                  </div>
                </div>

                {selectedDetection.false_positive == null && (
                  <div className="flex items-center gap-2 mt-1 md:mt-0 w-full md:w-auto">
                    <Button
                      onClick={() => sendDetectionConfirmation(selectedDetection.uuid, true)}
                      variant="outline"
                      className="flex-1 md:flex-none h-9 text-xs border-yellow-600/50 hover:bg-yellow-600/20 text-yellow-600 dark:text-yellow-500"
                    >
                      <XCircle size={14} className="mr-2" />
                      <span className="md:hidden">False Pos.</span>
                      <span className="hidden md:inline">Mark False Positive</span>
                    </Button>
                    <Button
                      onClick={() => sendDetectionConfirmation(selectedDetection.uuid, false)}
                      className="flex-1 md:flex-none h-9 text-xs bg-red-600 hover:bg-red-700 text-white border border-red-400/20"
                    >
                      <CheckCircle2 size={14} className="mr-2" />
                      <span className="md:hidden">Confirm</span>
                      <span className="hidden md:inline">Confirm Detection</span>
                    </Button>
                  </div>
                )}
              </div>
            </DialogHeader>

            {/* --- Modal Body --- */}
            <div className="flex-1 relative bg-black overflow-hidden group/modal">
              <div className="absolute inset-0 z-0 flex items-center justify-center">
                {/* HUD Source Label */}
                <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur px-2 py-1 rounded border border-white/10">
                  <span className="text-[10px] text-white/70 font-mono">
                    SOURCE: Onboard camera
                  </span>
                </div>

                <div className="w-full h-full relative group">
                  {/* Placeholder Image */}
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <div className="text-zinc-700 flex flex-col items-center">
                      <ScanLine size={64} />
                      <span className="text-xs font-mono mt-4 uppercase tracking-[0.2em]">
                        Image Data Unavailable
                      </span>
                    </div>
                  </div>

                  {/* Overlay HUD */}
                  <div className="absolute inset-0 pointer-events-none border-[20px] md:border-[30px] border-transparent">
                    <div className="absolute top-4 left-4 w-8 md:w-12 h-8 md:h-12 border-t-2 border-l-2 border-red-500/50"></div>
                    <div className="absolute top-4 right-4 w-8 md:w-12 h-8 md:h-12 border-t-2 border-r-2 border-red-500/50"></div>
                    <div className="absolute bottom-4 left-4 w-8 md:w-12 h-8 md:h-12 border-b-2 border-l-2 border-red-500/50"></div>
                    <div className="absolute bottom-4 right-4 w-8 md:w-12 h-8 md:h-12 border-b-2 border-r-2 border-red-500/50"></div>

                    {/* Bounding Box Simulation */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 md:w-1/4 h-1/3 md:h-1/4 border-2 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                      <div className="absolute -top-6 left-0 bg-red-500 text-black text-[10px] font-bold px-1.5 py-0.5">
                        THREAT: {(selectedDetection.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`
                                    absolute z-20 border-2 border-[hsl(var(--border-primary))] rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-[hsl(var(--bg-tertiary))] overflow-hidden transition-all duration-300 ease-in-out cursor-pointer group/map
                                    ${
                                      isMapExpanded
                                        ? 'inset-2 md:inset-auto md:bottom-6 md:right-6 md:w-[600px] md:h-[400px]'
                                        : 'bottom-4 right-4 w-28 h-28 md:bottom-6 md:right-6 md:w-80 md:h-52 md:hover:w-[600px] md:hover:h-[400px]'
                                    }
                                `}
                onClick={toggleMap}
              >
                {/* Map Header / Controls */}
                <div className="absolute top-0 left-0 right-0 z-[400] bg-[hsl(var(--bg-secondary))]/90 backdrop-blur border-b border-[hsl(var(--border-primary))] px-2 py-1 md:px-3 md:py-1.5 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-[hsl(var(--text-secondary))] flex items-center gap-2">
                    <MapPin size={10} />
                    <span
                      className={`hidden md:group-hover/map:inline ${isMapExpanded ? 'inline' : 'hidden'}`}
                    >
                      Geo-Location
                    </span>
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[10px] text-[hsl(var(--text-primary))] ${!isMapExpanded && 'hidden md:inline'}`}
                    >
                      {formatCoords(selectedDetection.location.x, selectedDetection.location.y)}
                    </span>
                    <div className="md:hidden text-[hsl(var(--text-muted))]">
                      {isMapExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="w-full h-full pt-6 md:pt-0">
                  <MapContainer
                    center={[selectedDetection.location.x, selectedDetection.location.y]}
                    zoom={18}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    attributionControl={false}
                    dragging={isMapExpanded || window.innerWidth > 768}
                  >
                    {theme === 'light' ? (
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap"
                      />
                    ) : (
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution="&copy; OpenStreetMap &copy; CARTO"
                      />
                    )}
                    <Marker position={[selectedDetection.location.x, selectedDetection.location.y]}>
                      {isMapExpanded && (
                        <Popup className="font-mono text-xs">
                          {selectedDetection.object} <br />
                          {(selectedDetection.confidence * 100).toFixed(1)}%
                        </Popup>
                      )}
                    </Marker>
                    <Circle
                      center={[selectedDetection.location.x, selectedDetection.location.y]}
                      radius={20}
                      pathOptions={{
                        color: 'red',
                        fillColor: 'red',
                        fillOpacity: 0.2,
                        weight: 1,
                        dashArray: '5, 5',
                      }}
                    />
                  </MapContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
