import { MapIcon, ChevronLeft, ChevronRight, SquareArrowOutUpRight } from 'lucide-react';
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.tsx";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { MapContainer, TileLayer, Polygon, Tooltip as LeafletTooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { latLngBounds } from 'leaflet';
import { Link } from "react-router-dom";
import { useMemo, useEffect } from "react";
import {Outpost} from "@/screens/common/types.ts";

interface OutpostMapProps {
    outposts: Outpost[];
    currentOutpostIndex: number;
    nextOutpost: () => void;
    prevOutpost: () => void;
    theme: string;
}

function MapController({ bounds }: { bounds: any }) {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
    }, [bounds, map]);
    return null;
}

export function OutpostMap({ outposts, currentOutpostIndex, nextOutpost, prevOutpost, theme }: OutpostMapProps) {
    const currentOutpost = outposts[currentOutpostIndex];

    const currentBounds = useMemo(() => {
        if (!currentOutpost?.area?.points) return undefined;

        const points = currentOutpost.area.points.map(p => [
            p.y,
            p.x
        ] as [number, number]);

        return latLngBounds(points);
    }, [currentOutpost]);

    return (
        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-lg">Quick navigation</CardTitle>
                    <CardDescription className="text-[hsl(var(--text-secondary))]">
                        {outposts.length > 0 ? (
                            <>Viewing <span className="text-[hsl(var(--accent))] font-medium">{currentOutpost?.name}</span> ({currentOutpostIndex + 1}/{outposts.length})</>
                        ) : (
                            "Operational zones map"
                        )}
                    </CardDescription>
                </div>
                {outposts.length > 0 && (
                    <div className="flex items-center gap-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link to={`/outposts/${outposts[currentOutpostIndex].uuid}`}>
                                        <Button variant="outline" size="icon" className="h-8 w-8 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))]">
                                            <SquareArrowOutUpRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Go to overview</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={prevOutpost} className="h-8 w-8 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))]">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Previous outpost</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={nextOutpost} className="h-8 w-8 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))]">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Next outpost</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {!outposts || outposts.length === 0 ? (
                    <div className="h-[300px] w-full rounded-lg border-2 border-dashed border-[hsl(var(--border-secondary))] flex flex-col items-center justify-center text-[hsl(var(--text-secondary))] bg-[hsl(var(--bg-tertiary))]/10">
                        <MapIcon className="h-10 w-10 mb-2 opacity-20" />
                        <p className="text-sm font-medium">No outposts detected</p>
                    </div>
                ) : (
                    <div className="h-[300px] rounded-lg overflow-hidden relative border border-[hsl(var(--border-secondary))]">
                        <MapContainer
                            center={[0, 0]}
                            zoom={13}
                            style={{ height: "100%", width: "100%" }}
                            zoomControl={false}
                            scrollWheelZoom={false}
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

                            {/* Updates view when outpost changes */}
                            {currentBounds && <MapController bounds={currentBounds} />}

                            {currentOutpost?.area?.points && (
                                <Polygon
                                    key={currentOutpost.uuid}
                                    positions={currentOutpost.area.points.map(p => [
                                        p.y, // Lat
                                        p.x  // Lng
                                    ] as [number, number])}
                                    pathOptions={{
                                        color: '#3b82f6',
                                        fillColor: '#3b82f6',
                                        fillOpacity: 0.2,
                                        weight: 2
                                    }}
                                >
                                    <LeafletTooltip
                                        permanent
                                        direction="center"
                                        className="bg-transparent border-0 text-white font-bold shadow-none"
                                    >
                                        {currentOutpost.name}
                                    </LeafletTooltip>
                                </Polygon>
                            )}
                        </MapContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
