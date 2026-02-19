import { Loader2 } from 'lucide-react';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiCall } from "@/utils/api.ts";

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {useTheme} from "@/ThemeProvider.tsx";
import { EditMap } from "./components/EditMap";
import { EditSidebar } from "./components/EditSidebar";
import {Outpost, OutpostSummary} from "@/screens/common/types.ts";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const parseToLatLng = (outpost: Outpost): L.LatLngExpression[] => {
    let points: Array<{ x: number, y: number }> = [];
    if (outpost.area?.points) {
        points = outpost.area.points;
    }
    return points.map(p => [p.y, p.x] as [number, number]);
};

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
        if (!outpostUuid) return
        const fetchOutpost = async () => {
            try {
                const data: any = await apiCall<OutpostSummary>(`/api/v1/outposts/${outpostUuid}/summary`, undefined, "GET");
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

        fetchOutpost();
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
                area: wktString
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
                        className="fixed inset-0 bg-black/50 z-1400 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <EditSidebar 
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    navigate={navigate}
                    name={name}
                    liveVertexCount={liveVertexCount}
                    saving={saving}
                    handleSave={handleSave}
                />

                <EditMap 
                    theme={theme}
                    polygonCoords={polygonCoords}
                    featureGroupRef={featureGroupRef}
                    handleEdit={handleEdit}
                    setSidebarOpen={setSidebarOpen}
                />
            </div>
        </div>
    );
}
