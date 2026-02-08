import {
    ArrowLeft, Crosshair, Search, AlertCircle, MapPin, Loader2, AlertTriangle, X, PanelLeft
} from 'lucide-react';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentPosition } from '@tauri-apps/plugin-geolocation';
import { AnimatePresence, motion } from "framer-motion";
import {useTheme} from "@/ThemeProvider.tsx";

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

// --- Map Controller ---
function MapController({ target }: { target: { lat: number; lng: number } | null }) {
    const map = useMap();
    useEffect(() => {
        if (target) {
            map.flyTo(target, 14, { duration: 1.5 });
        }
    }, [target, map]);
    return null;
}

export default function OutpostCreationScreen() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [outpostName, setOutpostName] = useState("");
    const [metrics, setMetrics] = useState({ area: 0, perimeter: 0 });
    const [isClosed, setIsClosed] = useState(false);

    const [coords, setCoords] = useState({ lat: 34.0522, lng: -118.2437 });
    const [mapTarget, setMapTarget] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const [locationWarning, setLocationWarning] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const { theme } = useTheme();

    useEffect(() => {
        if (locationWarning) {
            const timer = setTimeout(() => setLocationWarning(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [locationWarning]);

    const handleUseCurrentLocation = async () => {
        setIsLocating(true);
        setLocationWarning(null);
        setSidebarOpen(false)

        try {
            const position = await getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 3000,
                maximumAge: 0
            });

            if (position.coords.latitude !== 0 || position.coords.longitude !== 0) {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lng: longitude });
                setMapTarget({ lat: latitude, lng: longitude });
                return;
            }

            throw new Error("Invalid system coordinates (0,0)");

        } catch (error) {
            console.warn("Precise location failed, attempting IP fallback...", error);

            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();

                if (data.latitude && data.longitude) {
                    setCoords({ lat: data.latitude, lng: data.longitude });
                    setMapTarget({ lat: data.latitude, lng: data.longitude });

                    setLocationWarning("Precise signal unavailable. Using approximate IP-based location.");
                } else {
                    throw new Error("IP Location failed");
                }
            } catch (fallbackError) {
                console.error("All location methods failed:", fallbackError);
                setLocationWarning("Could not detect location. Please enter coordinates manually.");
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
        setCoords({ lat, lng });
        setMapTarget({ lat, lng });
        setSearchQuery(city.display_name.split(',')[0]);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && suggestions.length > 0) {
            handleSelectCity(suggestions[0]);
        }
    };

    const handleCreated = (e: any) => {
        const { layerType, layer } = e;
        if (layerType === 'polygon') {
            const latLngs = layer.getLatLngs()[0] as L.LatLng[];
            setMetrics({
                area: calculateArea(latLngs),
                perimeter: calculatePerimeter(latLngs)
            });
            setIsClosed(true);
        }
    };

    const handleDeleted = () => {
        setMetrics({ area: 0, perimeter: 0 });
        setIsClosed(false);
    };

    const handleDrawStart = () => {
        setIsClosed(false);
    };

    return (
        <div className="flex flex-col h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            <div className="flex flex-1 relative overflow-hidden">

                {/* Sidebar Overlay (Backdrop) */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-[1400] lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar (Editor Panel) */}
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
                            <h1 className="text-lg font-bold">New Outpost</h1>
                        </div>
                        <p className="text-xs text-[hsl(var(--text-secondary))] pl-7">Define operational zone parameters</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-[#3b4354] scrollbar-track-transparent">

                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Identification</h3>
                            <div className="space-y-2">
                                <Label className="text-xs">Designator / Name</Label>
                                <Input
                                    placeholder="e.g. OP-Alpha-01"
                                    className="h-9 text-sm"
                                    value={outpostName}
                                    onChange={e => setOutpostName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="h-px bg-[#282e39]" />

                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Coordinates</h3>
                                <button
                                    onClick={handleUseCurrentLocation}
                                    disabled={isLocating}
                                    className="text-[#135bec] text-xs font-medium hover:underline flex items-center gap-1 disabled:opacity-50"
                                >
                                    {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
                                    {isLocating ? "Locating..." : "Use Current"}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1.5">
                                    <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">Latitude</span>
                                    <Input
                                        value={coords.lat}
                                        onChange={(e) => setCoords({...coords, lat: parseFloat(e.target.value) || 0})}
                                        className="font-mono h-9 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">Longitude</span>
                                    <Input
                                        value={coords.lng}
                                        onChange={(e) => setCoords({...coords, lng: parseFloat(e.target.value) || 0})}
                                        className="font-mono h-9 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Metrics Section */}
                        <div className="h-px bg-[#282e39]" />
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Geofence Metrics</h3>
                                {isClosed ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                                        Boundary Closed
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-medium border border-yellow-500/20 flex items-center gap-1">
                                        <AlertCircle size={10} />
                                        Incomplete
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-2.5">
                                    <div className="text-[hsl(var(--text-secondary))] text-[10px] mb-0.5">Total Area</div>
                                    <div className="text-base font-bold text-[hsl(var(--text-primary))]">
                                        {metrics.area > 0 ? metrics.area.toFixed(2) : '-'} <span className="text-xs font-normal text-[hsl(var(--text-secondary))]">km²</span>
                                    </div>
                                </div>
                                <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-2.5">
                                    <div className="text-[hsl(var(--text-secondary))] text-[10px] mb-0.5">Perimeter</div>
                                    <div className="text-base font-bold text-[hsl(var(--text-primary))]">
                                        {metrics.perimeter > 0 ? metrics.perimeter.toFixed(2) : '-'} <span className="text-xs font-normal text-[hsl(var(--text-secondary))]">km</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border-t border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-secondary))] space-y-2">
                        <Button
                            className="w-full h-9 text-sm bg-white text-black hover:bg-gray-200"
                            disabled={!isClosed || !outpostName}
                        >
                            Create Outpost
                        </Button>
                        <Link to={"/outposts"}>
                            <Button variant="outline" className="w-full h-9 text-sm border-[hsl(var(--border-secondary))] hover:bg-[hsl(var(--bg-tertiary))]">Cancel</Button>
                        </Link>
                    </div>
                </aside>

                <main className="flex-1 relative bg-[hsl(var(--bg-primary))]">
                    <MapContainer
                        center={[34.0522, -118.2437]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                        className="z-0"
                        zoomControl={false}
                        onClick={() => setShowSuggestions(false)}
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
                        <FeatureGroup>
                            <EditControl
                                position="topright"
                                onCreated={handleCreated}
                                onDeleted={handleDeleted}
                                onDrawStart={handleDrawStart}
                                draw={{
                                    rectangle: false,
                                    circle: false,
                                    circlemarker: false,
                                    marker: false,
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
                                }}
                            />
                        </FeatureGroup>
                        <MapController target={mapTarget} />
                    </MapContainer>

                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-4 left-4 z-[1000] lg:hidden shadow-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))]"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <PanelLeft size={20} />
                    </Button>

                    <div className="absolute top-3.5 left-16 lg:left-4 z-[1000] w-[calc(100%-8rem)] lg:w-[calc(100%-2rem)] max-w-sm transition-[left] duration-200">
                        <div className="relative group">
                            <div className="absolute left-3 top-2.5 text-[hsl(var(--text-secondary))] group-focus-within:text-[hsl(var(--text-primary))] transition-colors">
                                <Search size={18} />
                            </div>
                            <input
                                className="w-full h-10 pl-10 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))]/95 backdrop-blur border border-[hsl(var(--border-primary))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] shadow-xl transition-colors placeholder:text-[hsl(var(--text-muted))]"
                                placeholder="Search cities..."
                                value={searchQuery}
                                onChange={handleSearchInput}
                                onKeyDown={handleKeyDown}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            />

                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                                    {suggestions.map((item, index) => (
                                        <button
                                            key={index}
                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#282e39] flex items-center gap-2 transition-colors border-b border-[hsl(var(--border-primary))] last:border-0"
                                            onClick={() => handleSelectCity(item)}
                                        >
                                            <MapPin size={14} className="text-[hsl(var(--text-secondary))] shrink-0" />
                                            <span className="truncate">
                                                <span className="font-medium text-[hsl(var(--text-primary))]">
                                                    {item.address?.city || item.address?.town || item.address?.village || item.name}
                                                </span>
                                                <span className="text-[hsl(var(--text-secondary))] text-xs ml-1.5 opacity-70">
                                                    {item.address?.country}
                                                </span>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {locationWarning && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, x: "-50%" }}
                                animate={{ opacity: 1, y: 0, x: "-50%" }}
                                exit={{ opacity: 0, y: 20, x: "-50%" }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="absolute bottom-24 left-1/2 z-[500] px-4 max-w-md w-full"
                            >
                                <div className="flex items-start gap-3 p-4 bg-[#0f1115] border-l-4 border-l-amber-500 border-y border-r border-y-[#282e39] border-r-[#282e39] rounded-r-lg shadow-2xl">

                                    <div className="p-2 bg-amber-500/10 rounded-full shrink-0">
                                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    </div>

                                    <div className="flex-1 pt-0.5">
                                        <h4 className="text-sm font-bold text-white mb-1">
                                            Approximate Location Only
                                        </h4>
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            {locationWarning}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setLocationWarning(null)}
                                        className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-md"
                                    >
                                        <span className="sr-only">Dismiss</span>
                                        <X size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Status Toast */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] px-4 max-w-md w-full">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--bg-tertiary))]/95 backdrop-blur border border-[hsl(var(--border-primary))] rounded-full shadow-xl">
                            <span className="relative flex h-2 w-2 shrink-0">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isClosed ? 'bg-emerald-400' : 'bg-yellow-400'}`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${isClosed ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                            </span>
                            <span className="text-xs text-[hsl(var(--text-secondary))] truncate">
                                {isClosed ? "Zone Defined. Ready to create." : "Drawing Mode Active. Click to add points."}
                            </span>
                            {!isClosed && (
                                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-[hsl(var(--border-secondary))] bg-[#282e39] px-1.5 font-mono text-[10px] font-medium text-[hsl(var(--text-secondary))] shrink-0">
                                    ESC
                                </kbd>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}