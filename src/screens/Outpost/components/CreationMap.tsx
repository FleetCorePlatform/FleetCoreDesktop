import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

interface CreationMapProps {
    theme: string;
    mapTarget: { lat: number; lng: number } | null;
    drawConfig: any;
    handleCreated: (e: any) => void;
    handleDeleted: () => void;
    handleEdited: (e: any) => void;
    handleDrawStart: (e: any) => void;
}

function MapController({ target }: { target: { lat: number; lng: number } | null }) {
    const map = useMap();
    useEffect(() => {
        if (target) {
            map.flyTo(target, 14, { duration: 1.5 });
        }
    }, [target, map]);
    return null;
}

export function CreationMap({
    theme,
    mapTarget,
    drawConfig,
    handleCreated,
    handleDeleted,
    handleEdited,
    handleDrawStart
}: CreationMapProps) {
    return (
        <MapContainer
            center={[34.0522, -118.2437]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
            zoomControl={false}
        >
            {theme === "light" ?
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
                    onEdited={handleEdited}
                    draw={drawConfig}
                />
            </FeatureGroup>
            <MapController target={mapTarget} />
        </MapContainer>
    );
}
