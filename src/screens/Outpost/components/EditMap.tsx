import { MapContainer, TileLayer, Polygon, FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { Button } from "@/components/ui/button.tsx";
import { PanelLeft } from 'lucide-react';

interface EditMapProps {
    theme: string;
    polygonCoords: L.LatLngExpression[];
    featureGroupRef: React.RefObject<L.FeatureGroup | null>;
    handleEdit: (e: any) => void;
    setSidebarOpen: (open: boolean) => void;
}

function MapBoundsController({ points }: { points: L.LatLngExpression[] }) {
    const map = useMap();
    useEffect(() => {
        if (points && points.length > 0) {
            try {
                const bounds = L.polygon(points).getBounds();
                if(bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            } catch(e) {}
        }
    }, [points, map]);
    return null;
}

export function EditMap({
    theme,
    polygonCoords,
    featureGroupRef,
    handleEdit,
    setSidebarOpen
}: EditMapProps) {
    return (
        <main className="flex-1 relative bg-[hsl(var(--bg-primary))]">
            <MapContainer
                center={[0, 0]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                className="z-0 bg-[hsl(var(--bg-tertiary))]"
                zoomControl={false}
            >
                {theme == "light" ?
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&COPY OpenStreetMap"
                    /> :
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                    />
                }

                <FeatureGroup ref={featureGroupRef}>
                    <EditControl
                        position="topright"
                        onEdited={handleEdit}
                        draw={{
                            rectangle: false,
                            circle: false,
                            circlemarker: false,
                            marker: false,
                            polyline: false,
                            polygon: false
                        }}
                    />
                    {polygonCoords.length > 0 && (
                        <Polygon
                            positions={polygonCoords}
                            pathOptions={{
                                color: '#135bec',
                                fillColor: '#135bec',
                                fillOpacity: 0.2,
                                weight: 2
                            }}
                        />
                    )}
                </FeatureGroup>

                <MapBoundsController points={polygonCoords} />
            </MapContainer>

            {/* --- MOBILE: Sidebar Toggle Button --- */}
            <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 left-4 z-[1000] lg:hidden shadow-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))]"
                onClick={() => setSidebarOpen(true)}
            >
                <PanelLeft size={20} />
            </Button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] px-4 max-w-md w-full">
                <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--bg-tertiary))]/95 backdrop-blur border border-[hsl(var(--border-primary))] rounded-full shadow-xl">
                    <span className="relative flex h-2 w-2 shrink-0">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-xs text-[hsl(var(--text-secondary))] truncate">
                        Edit Mode Active. Drag vertices to modify.
                    </span>
                </div>
            </div>
        </main>
    );
}
