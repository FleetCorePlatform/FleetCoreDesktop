import {
    Bell, Settings, User, Hexagon, Rocket, MapPin, Users, TrendingUp
} from 'lucide-react';
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx"
import { useState, useEffect } from "react";

interface Outpost {
    uuid: string;
    name: string;
}

export default function MissionPlanningScreen() {
    const [outposts, setOutposts] = useState<Outpost[]>([]);
    const [selectedOutpost, setSelectedOutpost] = useState<string>('');
    const [groupUUID, setGroupUUID] = useState<string>('');
    const [altitude, setAltitude] = useState<number>(15);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOutposts = async () => {
            try {
                const res = await fetch('/api/v1/outposts');
                const data = await res.json();
                setOutposts(data);
            } catch (error) {
                console.error('Failed to fetch outposts:', error);
            }
        };

        fetchOutposts();
    }, []);

    const validateUUID = (uuid: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    };

    const handleLaunch = async () => {
        if (!selectedOutpost || !groupUUID || altitude <= 0) {
            alert('Please fill all fields correctly');
            return;
        }

        if (!validateUUID(groupUUID)) {
            alert('Invalid Group UUID format');
            return;
        }

        setLoading(true);
        try {
            await fetch('/api/v1/missions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    outpost: selectedOutpost,
                    groupUUID: groupUUID,
                    altitude: altitude
                })
            });

            alert('Mission launched successfully!');

            // Reset form
            setSelectedOutpost('');
            setGroupUUID('');
            setAltitude(15);
        } catch (error) {
            console.error('Failed to launch mission:', error);
            alert('Failed to launch mission');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0f1115] text-white font-sans overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-[800px] mx-auto p-4 lg:p-6 space-y-6">

                    {/* Page Header */}
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-[#135bec]/20 border-2 border-[#135bec] rounded-full flex items-center justify-center mx-auto">
                            <Rocket size={32} className="text-[#135bec]" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Launch Survey Mission</h1>
                        <p className="text-sm text-[#9da6b9]">Configure automated survey parameters</p>
                    </div>

                    {/* Mission Configuration */}
                    <Card className="bg-[#111318] border-[#282e39]">
                        <CardHeader>
                            <CardTitle className="text-lg">Mission Parameters</CardTitle>
                            <CardDescription className="text-[#9da6b9]">
                                Select outpost, group, and flight altitude
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Outpost Selection */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} className="text-[#135bec]" />
                                    <Label className="text-sm font-medium">Target Outpost</Label>
                                </div>
                                <Select value={selectedOutpost} onValueChange={setSelectedOutpost}>
                                    <SelectTrigger className="bg-[#1c1f27] border-[#3b4354] h-11">
                                        <SelectValue placeholder="Select operational zone" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1c1f27] border-[#282e39]">
                                        {outposts.map((outpost) => (
                                            <SelectItem key={outpost.uuid} value={outpost.uuid} className="text-white hover:bg-[#282e39]">
                                                {outpost.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-[#9da6b9]">The geographical area where the survey will be conducted</p>
                            </div>

                            <div className="h-px bg-[#282e39]" />

                            {/* Group UUID */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Users size={18} className="text-[#135bec]" />
                                    <Label className="text-sm font-medium">Drone Group UUID</Label>
                                </div>
                                <Input
                                    value={groupUUID}
                                    onChange={(e) => setGroupUUID(e.target.value)}
                                    placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                                    className="bg-[#1c1f27] border-[#3b4354] h-11 font-mono text-sm"
                                />
                                <p className="text-xs text-[#9da6b9]">UUID of the drone group that will execute the mission</p>
                            </div>

                            <div className="h-px bg-[#282e39]" />

                            {/* Altitude */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={18} className="text-[#135bec]" />
                                    <Label className="text-sm font-medium">Flight Altitude</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        value={altitude}
                                        onChange={(e) => setAltitude(parseInt(e.target.value))}
                                        min={1}
                                        className="bg-[#1c1f27] border-[#3b4354] h-11"
                                    />
                                    <span className="text-sm text-[#9da6b9] whitespace-nowrap">meters AGL</span>
                                </div>
                                <p className="text-xs text-[#9da6b9]">Survey altitude above ground level (must be greater than 0)</p>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Launch Actions */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleLaunch}
                            disabled={loading || !selectedOutpost || !groupUUID || altitude <= 0}
                            className="w-full h-12 bg-white text-black hover:bg-gray-200 text-base font-medium"
                        >
                            <Rocket size={20} className="mr-2" />
                            {loading ? 'Launching...' : 'Launch Survey Mission'}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-10 border-[#3b4354] hover:bg-[#1c1f27]"
                        >
                            Cancel
                        </Button>
                    </div>

                    {/* Info Card */}
                    <Card className="bg-[#135bec]/10 border-[#135bec]/30">
                        <CardContent className="p-4">
                            <p className="text-xs text-[#9da6b9]">
                                <strong className="text-white">Note:</strong> This automated survey will cover the entire outpost area at the specified altitude.
                                Ensure all drones in the selected group are operational and have sufficient battery.
                            </p>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}