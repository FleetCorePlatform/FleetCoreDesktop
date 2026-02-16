import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiCall } from "@/utils/api.ts";
import { MaintenanceRecord } from "./types";
import { MaintenanceHeader } from "./components/MaintenanceHeader";
import { MaintenanceControls } from "./components/MaintenanceControls";
import { MaintenanceList } from "./components/MaintenanceList";

export default function MaintenanceScreen() {
    const { outpostUuid } = useParams<{ outpostUuid: string }>();

    const [records, setRecords] = useState<MaintenanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string | null>(null);

    useEffect(() => {
        if (!outpostUuid) return;

        setLoading(true);

        apiCall<MaintenanceRecord[]>("/api/v1/maintenance", { "outpost_uuid": outpostUuid }, "GET", undefined)
            .then(res => setRecords(res))
            .catch(e => {
                console.error("Cannot fetch maintenances: ", e);
                setRecords([]);
            })
            .finally(() => {
                setLoading(false);
            })
    }, [outpostUuid]);

    const handleComplete = async (id: string) => {
        const now = new Date().toISOString();
        setRecords(prev => prev.map(r => {
            if (r.uuid === id) {
                return {
                    ...r,
                    performed_at: now,
                    performed_by: 'Pending Sync...'
                };
            }
            return r;
        }));

        try {
            await apiCall(`/api/v1/maintenance/${id}`, undefined, "PATCH");
        } catch (e) {
            console.error(`PATCH failed for ${id}`, e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this maintenance record?")) return;

        const previousRecords = [...records];
        setRecords(prev => prev.filter(r => r.uuid !== id));

        try {
            await apiCall(`/api/v1/maintenance/${id}`, undefined, "DELETE");
        } catch (e) {
            console.error(`DELETE failed for ${id}`, e);
            setRecords(previousRecords);
        }
    };

    const getTypeColor = (type: string) => {
        const t = type.toLowerCase();
        if (['hull', 'crash', 'damage', 'critical', 'fail', 'emergency', 'leak'].some(k => t.includes(k)))
            return "text-red-400 border-red-400/30 bg-red-400/10";
        if (['motor', 'rotor', 'propeller', 'repair', 'replace', 'battery', 'gear', 'servo'].some(k => t.includes(k)))
            return "text-orange-400 border-orange-400/30 bg-orange-400/10";
        if (['soft', 'firmware', 'patch', 'update', 'glitch', 'boot', 'os', 'ai', 'logic'].some(k => t.includes(k)))
            return "text-purple-400 border-purple-400/30 bg-purple-400/10";
        if (['sensor', 'lidar', 'calibration', 'cam', 'vision', 'optical', 'radar', 'gps'].some(k => t.includes(k)))
            return "text-blue-400 border-blue-400/30 bg-blue-400/10";
        if (['routine', 'check', 'inspect', 'clean', 'wash', 'log', 'standard'].some(k => t.includes(k)))
            return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
        return "text-slate-400 border-slate-400/30 bg-slate-400/10";
    };

    const availableTypes = Array.from(new Set(records.map(r => r.maintenance_type)));

    const filteredRecords = records.filter(r => {
        const matchesSearch = r.drone_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter ? r.maintenance_type === typeFilter : true;

        return matchesSearch && matchesType;
    });

    const pendingRecords = filteredRecords.filter(r => !r.performed_at);
    const historyRecords = filteredRecords.filter(r => r.performed_at);

    if (loading) {
        return <div className="p-8 text-center text-[hsl(var(--text-secondary))] font-mono">Loading maintenance logs...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            <MaintenanceHeader />

            <div className="flex-1 overflow-auto p-4 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
                <MaintenanceControls
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    availableTypes={availableTypes}
                />

                <MaintenanceList
                    pendingRecords={pendingRecords}
                    historyRecords={historyRecords}
                    typeFilter={typeFilter}
                    handleDelete={handleDelete}
                    handleComplete={handleComplete}
                    getTypeColor={getTypeColor}
                />
            </div>
        </div>
    );
}
