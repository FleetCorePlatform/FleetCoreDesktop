import {
    ArrowLeft, Crosshair, Save, Loader2, PanelLeft
} from 'lucide-react';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { FeatureGroup } from "react-leaflet";

import { Button } from "@/components/ui/button.tsx"
import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { apiCall } from "@/utils/api.ts";

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {useTheme} from "@/ThemeProvider.tsx";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const parseToLatLng = (outpost: any): L.LatLngExpression[] => {
    let points: Array<{ x: number, y: number }> = [];

    if (outpost.wkt_polygon) {
        try {
            const content = outpost.wkt_polygon.replace(/^POLYGON\s*\(\(/, "").replace(/\)\)$/, "");
            points = content.split(", ").map((pair: string) => {
                const [x, y] = pair.split(" ").map(Number);
                return { x, y };
            });
        } catch (e) { console.error("WKT Parse Error", e); }
    } else if (outpost.area?.points) {
        points = outpost.area.points;
    }
    return points.map(p => [p.y, p.x] as [number, number]);
};

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

export default function OutpostEditScreen() {
    const { outpostUuid } = useParams<{ outpostUuid: string }>();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState("");
    const [polygonCoords, setPolygonCoords] = useState<L.LatLngExpression[]>([]);

    const [liveVertexCount, setLiveVertexCount] = useState(0);

    const featureGroupRef = useRef<L.FeatureGroup>(null);

    const { theme } = useTheme();


    useEffect(() => {
        const fetchOutpost = async () => {
            try {
                const data = await apiCall(`/api/v1/outposts/${outpostUuid}/summary`, undefined, "GET");
                setName(data.name);

                const coords = parseToLatLng(data);
                setPolygonCoords(coords);
                setLiveVertexCount(coords.length);

            } catch (error) {
                console.error("Failed to load outpost", error);
            } finally {
                setLoading(false);
            }
        };
        if (outpostUuid) fetchOutpost();
    }, [outpostUuid]);

    const handleEdit = (e: any) => {
        e.layers.eachLayer((layer: any) => {
            if (layer instanceof L.Polygon) {
                const latlngs = layer.getLatLngs();
                const ring = Array.isArray(latlngs) ? (Array.isArray(latlngs[0]) ? latlngs[0] : latlngs) : [];
                setLiveVertexCount(ring.length);
            }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let finalCoords: any[] = [];

            if (featureGroupRef.current) {
                const layers = featureGroupRef.current.getLayers();
                if (layers.length > 0) {
                    const poly = layers[0] as L.Polygon;
                    const latlngs = poly.getLatLngs();
                    const ring = Array.isArray(latlngs) ? (Array.isArray(latlngs[0]) ? latlngs[0] : latlngs) : [];
                    finalCoords = ring.map((ll: any) => ({ lat: ll.lat, lng: ll.lng }));
                }
            }

            if (finalCoords.length === 0) {
                finalCoords = (polygonCoords as any[]).map(c => ({ lat: c[0], lng: c[1] }));
            }

            if (finalCoords.length > 0) {
                const first = finalCoords[0];
                const last = finalCoords[finalCoords.length - 1];
                if (first.lat !== last.lat || first.lng !== last.lng) {
                    finalCoords.push(first);
                }
            }

            const wktString = `POLYGON ((${finalCoords.map(c => `${c.lng} ${c.lat}`).join(", ")}))`;

            const payload = {
                name: name,
                wkt_polygon: wktString
            };

            await apiCall(`/api/v1/outposts/${outpostUuid}`, undefined, "PUT", payload);
            navigate("/outposts");

        } catch (e) {
            console.error("Save failed", e);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-secondary))]">
                <Loader2 className="animate-spin mr-2" /> Loading Configuration...
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            <div className="flex flex-1 relative overflow-hidden">

                {/* Sidebar Overlay (Mobile) */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-[1400] lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    fixed lg:relative
                    w-full sm:w-[340px]
                    flex flex-col bg-[hsl(var(--bg-secondary))] border-r border-[hsl(var(--border-primary))] 
                    z-[1500] lg:z-20 shadow-2xl
                    transition-transform duration-300 ease-in-out
                    h-[calc(100vh-57px)]
                `}>
                    <div className="px-5 py-4 border-b border-[hsl(var(--border-primary))]">
                        <div className="flex items-center gap-2 mb-1">
                            <Link to="/outposts">
                                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8 -ml-2 text-[hsl(var(--text-secondary))]">
                                    <ArrowLeft size={18} />
                                </Button>
                            </Link>
                            <h1 className="text-lg font-bold">Edit Geofence</h1>
                        </div>
                        <p className="text-xs text-[hsl(var(--text-secondary))] pl-7">Modify operational zone parameters</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-[#3b4354] scrollbar-track-transparent">

                        <div className="grid grid-cols-[2fr_1fr] gap-3">
                            <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-2.5">
                                <div className="text-[hsl(var(--text-secondary))] text-[10px] mb-1 uppercase tracking-wider">Designator</div>
                                <div className="text-sm font-bold text-[hsl(var(--text-primary))] truncate" title={name}>{name}</div>
                            </div>
                            <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-2.5">
                                <div className="text-[hsl(var(--text-secondary))] text-[10px] mb-1 uppercase tracking-wider">Vertices</div>
                                <div className="text-sm font-bold text-[hsl(var(--text-primary))]">{liveVertexCount}</div>
                            </div>
                        </div>

                        <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex gap-2">
                            <Crosshair size={16} className="shrink-0 mt-0.5" />
                            <div>Drag the white handles on the map to resize.</div>
                        </div>
                    </div>

                    <div className="p-5 border-t border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-secondary))] space-y-2">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full h-9 text-sm bg-white text-black hover:bg-gray-200"
                        >
                            {saving ? (
                                <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Saving...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/outposts")}
                            className="w-full h-9 text-sm border-[hsl(var(--border-secondary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]"
                        >
                            Cancel
                        </Button>
                    </div>
                </aside>

                {/* Map Area */}
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
            </div>
        </div>
    );
}