import {Marker, useMapEvents} from "react-leaflet";

export function LocationSelector({
                              position,
                              onLocationSelect,
                          }: {
    position: { lat: number; lng: number } | null;
    onLocationSelect: (lat: number, lng: number) => void;
}) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position ? <Marker position={position} /> : null;
}