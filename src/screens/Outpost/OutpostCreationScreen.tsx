import {
    PanelLeft
} from 'lucide-react';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { Button } from "@/components/ui/button.tsx"
import {useState, useEffect, useRef, useMemo} from "react";
import { useNavigate } from "react-router-dom";
import {useTheme} from "@/ThemeProvider.tsx";
import {apiCall} from "@/utils/api.ts";
import {CreateOutpostBody} from "@/models/Outpost.ts";
import {Coords} from "@/screens/Outpost/types.ts";
import getCurrentLocation, {getIpLocation} from "@/utils/location.ts";
import { CreationMap } from "./components/CreationMap";
import { CreationSidebar } from "./components/CreationSidebar";
import { CreationSearch } from "./components/CreationSearch";
import { CreationLoading } from "./components/CreationLoading";
import { CreationWarning } from "./components/CreationWarning";
import { CreationStatus } from "./components/CreationStatus";

const calculateArea = (latLngs: L.LatLng[]): number => {
    if (latLngs.length < 3) return 0;
    const EARTH_RADIUS = 6371000;
    const TO_RAD = Math.PI / 180;
    const centerLat = latLngs.reduce((sum, p) => sum + p.lat, 0) / latLngs.length;
    const cosLat = Math.cos(centerLat * TO_RAD);
    let area = 0;
    for (let i = 0; i < latLngs.length; i++) {
        const j = (i + 1) % latLngs.length;
        const p1 = latLngs[i];
        const p2 = latLngs[j];
        const x1 = p1.lng * TO_RAD * EARTH_RADIUS * cosLat;
        const y1 = p1.lat * TO_RAD * EARTH_RADIUS;
        const x2 = p2.lng * TO_RAD * EARTH_RADIUS * cosLat;
        const y2 = p2.lat * TO_RAD * EARTH_RADIUS;
        area += (x1 * y2) - (x2 * y1);
    }
    return Math.abs(area) / 2 / 1_000_000;
};

const calculatePerimeter = (latLngs: L.LatLng[]): number => {
    if (latLngs.length < 2) return 0;
    let dist = 0;
    for (let i = 0; i < latLngs.length; i++) {
        const p1 = latLngs[i];
        const p2 = latLngs[(i + 1) % latLngs.length];
        dist += p1.distanceTo(p2);
    }
    return dist / 1000;
};

function OutpostCreationScreen() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [outpostName, setOutpostName] = useState("");
    const [metrics, setMetrics] = useState({area: 0, perimeter: 0});
    const [isClosed, setIsClosed] = useState(false);

    const [coords, setCoords] = useState<Coords>({lat: 0.0, lng: 0.0});
    const [mapTarget, setMapTarget] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const [locationWarning, setLocationWarning] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const [polygonPoints, setPolygonPoints] = useState<{ x: number, y: number }[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const { theme } = useTheme();

    useEffect(() => {
        if (locationWarning) {
            const timer = setTimeout(() => setLocationWarning(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [locationWarning]);

    const postOutpostForm = async () => {
        const closedPoints = [...polygonPoints];

        if (closedPoints.length > 0) {
            const first = closedPoints[0];
            const last = closedPoints[closedPoints.length - 1];

            if (first.x !== last.x || first.y !== last.y) {
                closedPoints.push(first);
            }
        }

        const payload: CreateOutpostBody = {
            name: "Outpost Alpha",
            latitude: coords.lat,
            longitude: coords.lng,
            area: {
                points: closedPoints,
            }
        };

        try {
            await apiCall("/api/v1/outposts", undefined, "POST", payload);
            navigate("/outposts");
        } catch (e) {
            console.error("Failed to create outpost", e);
            setIsSubmitting(false);
        }
    }

    const handleUseCurrentLocation = async () => {
        setIsLocating(true);
        setLocationWarning(null);
        setSidebarOpen(false);

        try {
            const coords = await getCurrentLocation();
            setCoords(coords);
            setMapTarget(coords);
        } catch (error: any) {
            const errorMsg = error?.message || error?.toString() || "";

            if (errorMsg.includes("Location services are disabled")) {
                setLocationWarning("SYSTEM LOCATION OFF: Please turn on the Location toggle in your Android Quick Settings.");
            } else if (errorMsg.includes("denied")) {
                setLocationWarning("Permission denied. Please enable Location permissions for this app in Settings.");
            } else {
                console.log("GPS failed, attempting IP fallback...");
                try {
                    const ipCoords = await getIpLocation();
                    setCoords(ipCoords);
                    setMapTarget(ipCoords);
                    setLocationWarning("Using approximate IP-based location (GPS failed).");
                } catch (fallbackError) {
                    setLocationWarning("Could not detect location. Please enter coordinates manually.");
                }
            }
        } finally {
            setIsLocating(false);
        }
    };

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (value.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&featuretype=city&limit=5&addressdetails=1`
                );
                const data = await response.json();
                setSuggestions(data);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Geocoding failed", error);
            }
        }, 300);
    };

    const handleSelectCity = (city: any) => {
        const lat = parseFloat(city.lat);
        const lng = parseFloat(city.lon);
        setCoords({lat, lng});
        setMapTarget({lat, lng});
        setSearchQuery(city.display_name.split(',')[0]);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && suggestions.length > 0) {
            handleSelectCity(suggestions[0]);
        }
    };

    const updateGeometry = (layer: any) => {
        const latLngs = layer.getLatLngs()[0] as L.LatLng[];

        setMetrics({
            area: calculateArea(latLngs),
            perimeter: calculatePerimeter(latLngs)
        });

        const formattedPoints = latLngs.map(p => ({
            x: p.lng,
            y: p.lat
        }));

        setPolygonPoints(formattedPoints);
        setIsClosed(true);
    };

    const handleCreated = (e: any) => {
        const { layerType, layer } = e;
        if (layerType === 'polygon') {
            updateGeometry(layer);
        } else if (layerType === 'marker') {
            const { lat, lng } = layer.getLatLng();
            setCoords({ lat, lng });
        }
    };

    const handleEdited = (e: any) => {
        const layers = e.layers;
        layers.eachLayer((layer: any) => {
            if (layer.getLatLngs) {
                updateGeometry(layer);
            } else if (layer.getLatLng) {
                const { lat, lng } = layer.getLatLng();
                setCoords({ lat, lng });
            }
        });
    };

    const handleDeleted = () => {
        setMetrics({ area: 0, perimeter: 0 });
        setPolygonPoints([]);
        setIsClosed(false);
    };

    const handleDrawStart = (e: any) => {
        if (e.layerType === 'polygon') {
            setIsClosed(false);
            // setPolygonPoints([]);
        }
    };

    const drawConfig = useMemo(() => ({
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: true,
        polyline: false,
        polygon: {
            allowIntersection: false,
            showArea: false,
            shapeOptions: {
                color: '#135bec',
                fillColor: '#135bec',
                fillOpacity: 0.2,
                weight: 2
            }
        }
    }), []);

    return (
        <div
            className="flex flex-col h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            
            <CreationLoading isSubmitting={isSubmitting} />

            <div className="flex flex-1 relative overflow-hidden">

                {/* Sidebar Overlay (Backdrop) */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-[1400] lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar (Editor Panel) */}
                <CreationSidebar 
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    outpostName={outpostName}
                    setOutpostName={setOutpostName}
                    handleUseCurrentLocation={handleUseCurrentLocation}
                    isLocating={isLocating}
                    coords={coords}
                    setCoords={setCoords}
                    metrics={metrics}
                    isClosed={isClosed}
                    postOutpostForm={postOutpostForm}
                    isSubmitting={isSubmitting}
                />

                <main className="flex-1 relative bg-[hsl(var(--bg-primary))]">
                    <CreationMap 
                        theme={theme}
                        mapTarget={mapTarget}
                        drawConfig={drawConfig}
                        handleCreated={handleCreated}
                        handleDeleted={handleDeleted}
                        handleEdited={handleEdited}
                        handleDrawStart={handleDrawStart}
                    />

                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-4 left-4 z-[1000] lg:hidden shadow-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))]"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <PanelLeft size={20}/>
                    </Button>

                    <CreationSearch 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        handleSearchInput={handleSearchInput}
                        handleKeyDown={handleKeyDown}
                        showSuggestions={showSuggestions}
                        suggestions={suggestions}
                        handleSelectCity={handleSelectCity}
                        setShowSuggestions={setShowSuggestions}
                    />

                    <CreationWarning 
                        locationWarning={locationWarning}
                        setLocationWarning={setLocationWarning}
                    />

                    <CreationStatus isClosed={isClosed} />
                </main>
            </div>
        </div>
    );
}


export default OutpostCreationScreen