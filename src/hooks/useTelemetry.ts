import { LiveTelemetryData } from "@/screens/Drone/types.ts";
import { useEffect, useState } from "react";
import { addTelemetryListener, removeTelemetryListener } from "@/utils/droneManualControl.ts";

export function useTelemetry() {
    const [telemetry, setTelemetry] = useState<LiveTelemetryData | null>(null);
    const [history, setHistory] = useState<{ timestamp: number; data: LiveTelemetryData }[]>([]);

    useEffect(() => {
        const handleTelemetryData = (incoming: LiveTelemetryData) => {
            const timestamp = Date.now();
            setTelemetry(incoming);
            setHistory((prev) => [
                ...prev.filter((p) => timestamp - p.timestamp < 30_000),
                { timestamp, data: incoming },
            ]);
        };

        addTelemetryListener(handleTelemetryData);

        return () => {
            removeTelemetryListener(handleTelemetryData);
        };
    }, []);

    return { telemetry, history }
}