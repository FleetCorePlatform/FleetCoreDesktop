import {
    Bell, Settings, User, Hexagon,
    Plus, Activity, MapPin, AlertCircle, TrendingUp
} from 'lucide-react';
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Mission {
    uuid: string;
    status: string;
    outpost?: string;
    groupUUID?: string;
    altitude?: number;
}

interface Outpost {
    uuid: string;
    name: string;
    latitude: number;
    longitude: number;
    area?: {
        points: Array<{ x: number; y: number }>;
    };
}

export default function DashboardScreen() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [outposts, setOutposts] = useState<Outpost[]>([]);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const [missionsRes, outpostsRes] = await Promise.all([
    //                 fetch('/api/v1/missions'),
    //                 fetch('/api/v1/outposts')
    //             ]);
    //
    //             const missionsData = await missionsRes.json();
    //             const outpostsData = await outpostsRes.json();
    //
    //             setMissions(missionsData);
    //             setOutposts(outpostsData);
    //         } catch (error) {
    //             console.error('Failed to fetch data:', error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //
    //     fetchData();
    // }, []);

    const activeMissions = missions.filter(m => m.status === 'active').length;

    return (
        <div className="flex flex-col h-screen bg-[#0f1115] text-white font-sans overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-[1400px] mx-auto p-4 lg:p-6 space-y-6">

                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Operations Dashboard</h1>
                            <p className="text-sm text-[#9da6b9] mt-1">Monitor fleet activity and system status</p>
                        </div>
                        <Button className="bg-white text-black hover:bg-gray-200 h-9">
                            <Plus size={16} className="mr-1" />
                            New Mission
                        </Button>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-[#111318] border-[#282e39]">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-[#9da6b9] mb-1">Active Missions</p>
                                        <p className="text-3xl font-bold">{activeMissions}</p>
                                        <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                                            <TrendingUp size={12} />
                                            {missions.length} total
                                        </p>
                                    </div>
                                    <div className="text-[#135bec]">
                                        <Activity size={32} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#111318] border-[#282e39]">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-[#9da6b9] mb-1">Registered Outposts</p>
                                        <p className="text-3xl font-bold">{outposts.length}</p>
                                        <p className="text-xs text-[#9da6b9] mt-1">Operational zones</p>
                                    </div>
                                    <div className="text-emerald-400">
                                        <MapPin size={32} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#111318] border-[#282e39]">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-[#9da6b9] mb-1">System Status</p>
                                        <p className="text-3xl font-bold text-emerald-400">Operational</p>
                                        <p className="text-xs text-[#9da6b9] mt-1">All systems nominal</p>
                                    </div>
                                    <div className="text-emerald-400">
                                        <AlertCircle size={32} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Mission Feed */}
                        <Card className="bg-[#111318] border-[#282e39]">
                            <CardHeader>
                                <CardTitle className="text-lg">Recent Missions</CardTitle>
                                <CardDescription className="text-[#9da6b9]">
                                    Latest mission activity
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {loading ? (
                                        <p className="text-sm text-[#9da6b9]">Loading...</p>
                                    ) : missions.length === 0 ? (
                                        <p className="text-sm text-[#9da6b9]">No missions found</p>
                                    ) : (
                                        missions.slice(0, 5).map((mission) => (
                                            <div key={mission.uuid} className="flex items-center justify-between p-3 bg-[#1c1f27] rounded-lg border border-[#282e39]">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium font-mono">{mission.uuid.substring(0, 8)}</p>
                                                    <p className="text-xs text-[#9da6b9] mt-0.5">Altitude: {mission.altitude || 'N/A'}m</p>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        mission.status === 'active'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    }
                                                >
                                                    {mission.status}
                                                </Badge>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Map Widget */}
                        <Card className="bg-[#111318] border-[#282e39]">
                            <CardHeader>
                                <CardTitle className="text-lg">Outpost Overview</CardTitle>
                                <CardDescription className="text-[#9da6b9]">
                                    Operational zones map
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] rounded-lg overflow-hidden">
                                    <MapContainer
                                        center={[34.0522, -118.2437]}
                                        zoom={10}
                                        style={{ height: "100%", width: "100%" }}
                                        zoomControl={false}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; OpenStreetMap'
                                        />
                                        {outposts.map((outpost) => {
                                            if (outpost.area?.points) {
                                                const positions = outpost.area.points.map(p => [
                                                    outpost.latitude + p.x,
                                                    outpost.longitude + p.y
                                                ] as [number, number]);

                                                return (
                                                    <Polygon
                                                        key={outpost.uuid}
                                                        positions={positions}
                                                        pathOptions={{
                                                            color: '#135bec',
                                                            fillColor: '#135bec',
                                                            fillOpacity: 0.2,
                                                            weight: 2
                                                        }}
                                                    />
                                                );
                                            }
                                            return null;
                                        })}
                                    </MapContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}