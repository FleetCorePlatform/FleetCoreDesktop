import {
    ArrowLeft, Crosshair, Search, ChevronDown,
} from 'lucide-react';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { useState } from "react";
import {Link} from "react-router-dom";

export default function OutpostCreationScreen() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex flex-col h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            {/* --- Main Layout --- */}
            <div className="flex flex-1 relative overflow-hidden">

                {/* Sidebar Overlay for Mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* --- Sidebar Configuration Panel --- */}
                <aside className={`
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    fixed lg:relative
                    w-full sm:w-[340px]
                    flex flex-col bg-[hsl(var(--bg-secondary))] border-r border-[hsl(var(--border-primary))] z-50 lg:z-20 shadow-2xl
                    transition-transform duration-300 ease-in-out
                    h-[calc(100vh-57px)]
                `}>

                    {/* Panel Header */}
                    <div className="px-5 py-4 border-b border-[hsl(var(--border-primary))]">
                        <div className="flex items-center gap-2 mb-1">
                            <Link to="/outposts">
                                <Button className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors">
                                    <ArrowLeft size={20} />
                                </Button>
                            </Link>
                            <h1 className="text-lg font-bold">New Outpost</h1>
                        </div>
                        <p className="text-xs text-[hsl(var(--text-secondary))] pl-7">Define operational zone parameters</p>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-[#3b4354] scrollbar-track-transparent">

                        {/* Section: Identification */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Identification</h3>
                            <div className="space-y-2">
                                <Label className="text-xs">Designator / Name</Label>
                                <Input placeholder="e.g. OP-Alpha-01" defaultValue="OP-Bravo-04" className="h-9 text-sm" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Operational Status</Label>
                                <div className="relative">
                                    <select className="w-full h-9 appearance-none rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-secondary))] px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]">
                                        <option>Active</option>
                                        <option>Planning</option>
                                        <option>Decommissioned</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-[hsl(var(--text-secondary))] pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-[#282e39]" />

                        {/* Section: Coordinates */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Coordinates</h3>
                                <button className="text-[#135bec] text-xs font-medium hover:underline flex items-center gap-1">
                                    <Crosshair size={14} /> Use Current
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1.5">
                                    <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">Latitude</span>
                                    <Input defaultValue="34.0522 N" className="font-mono h-9 text-xs" />
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">Longitude</span>
                                    <Input defaultValue="118.2437 W" className="font-mono h-9 text-xs" />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-[#282e39]" />

                        {/* Section: Metrics */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Geofence Metrics</h3>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                                    Boundary Closed
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-2.5">
                                    <div className="text-[hsl(var(--text-secondary))] text-[10px] mb-0.5">Total Area</div>
                                    <div className="text-base font-bold">4.2 <span className="text-xs font-normal text-[hsl(var(--text-secondary))]">km²</span></div>
                                </div>
                                <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-2.5">
                                    <div className="text-[hsl(var(--text-secondary))] text-[10px] mb-0.5">Perimeter</div>
                                    <div className="text-base font-bold">8.5 <span className="text-xs font-normal text-[hsl(var(--text-secondary))]">km</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Description */}
                        <div className="space-y-2">
                            <Label className="text-xs">Description</Label>
                            <textarea
                                className="w-full min-h-[90px] rounded-lg border border-[hsl(var(--border-secondary))] bg-[hsl(var(--bg-tertiary))] p-2.5 text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-muted))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))] resize-none"
                                placeholder="Operational notes..."
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-5 border-t border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-secondary))] space-y-2">
                        <Button className="w-full h-9 text-sm bg-white text-black hover:bg-gray-200">Create Outpost</Button>
                        <Button variant="outline" className="w-full h-9 text-sm border-[hsl(var(--border-secondary))] hover:bg-[hsl(var(--bg-tertiary))]">Cancel</Button>
                    </div>
                </aside>

                {/* --- Map View Area --- */}
                <main className="flex-1 relative bg-[hsl(var(--bg-primary))]">
                    <MapContainer
                        center={[34.0522, -118.2437]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                        className="z-0"
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap'
                        />
                        <FeatureGroup>
                            <EditControl
                                position="topright"
                                draw={{
                                    rectangle: false,
                                    circle: false,
                                    circlemarker: false,
                                    marker: false,
                                    polyline: false,
                                    polygon: {
                                        shapeOptions: {
                                            color: '#135bec',
                                            fillColor: '#135bec',
                                            fillOpacity: 0.2,
                                            weight: 2
                                        }
                                    }
                                }}
                                onCreated={(e) => {
                                    const { layer } = e;
                                    if (layer instanceof L.Polygon) {
                                        const latLngs = layer.getLatLngs()[0] as L.LatLng[];
                                        const coordinates = latLngs.map((latLng) => ({
                                            lat: latLng.lat,
                                            lng: latLng.lng,
                                        }));
                                        console.log("Polygon drawn:", coordinates);
                                    }
                                }}
                            />
                        </FeatureGroup>
                    </MapContainer>

                    {/* Floating UI: Search */}
                    <div className="absolute top-4 left-4 z-[1000] w-[calc(100%-2rem)] max-w-sm">
                        <div className="relative">
                            <div className="absolute left-3 top-2.5 text-[hsl(var(--text-secondary))]">
                                <Search size={18} />
                            </div>
                            <input
                                className="w-full h-10 pl-10 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))]/95 backdrop-blur border border-[hsl(var(--border-primary))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] shadow-xl transition-colors placeholder:text-[hsl(var(--text-muted))]"
                                placeholder="Search coordinates or location..."
                            />
                        </div>
                    </div>

                    {/* Floating UI: Zoom Controls */}
                    <div className="absolute bottom-20 right-4 z-[1000] flex flex-col gap-2">
                        <div className="flex flex-col bg-[hsl(var(--bg-tertiary))]/95 backdrop-blur border border-[hsl(var(--border-primary))] rounded-lg shadow-xl overflow-hidden">
                            <button className="h-9 w-9 flex items-center justify-center hover:bg-[hsl(var(--bg-hover))] text-[hsl(var(--text-primary))] transition-colors border-b border-[hsl(var(--border-primary))]">
                                <span className="text-lg font-light">+</span>
                            </button>
                            <button className="h-9 w-9 flex items-center justify-center hover:bg-[hsl(var(--bg-hover))] text-[hsl(var(--text-primary))] transition-colors">
                                <span className="text-lg font-light">−</span>
                            </button>
                        </div>
                    </div>

                    {/* Floating UI: Toast/Status */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] px-4 max-w-md w-full">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--bg-tertiary))]/95 backdrop-blur border border-[hsl(var(--border-primary))] rounded-full shadow-xl">
                            <span className="relative flex h-2 w-2 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs text-[hsl(var(--text-secondary))] truncate">Drawing Mode Active. Click to add points.</span>
                            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-[hsl(var(--border-secondary))] bg-[#282e39] px-1.5 font-mono text-[10px] font-medium text-[hsl(var(--text-secondary))] shrink-0">
                                ESC
                            </kbd>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}