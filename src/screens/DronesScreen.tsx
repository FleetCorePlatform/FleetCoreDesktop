import {
    Plus, Plane, MoreVertical, FolderOpen, UserMinus
} from 'lucide-react';
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.tsx"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog.tsx"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx"
import { useState, useEffect } from "react";

interface Drone {
    uuid: string;
    droneName: string;
    address: string;
    px4Version?: string;
    groupName?: string;
}

export default function FleetScreen() {
    const [groupUUID, setGroupUUID] = useState<string>('');
    const [drones, setDrones] = useState<Drone[]>([]);
    const [loading, setLoading] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);

    // Register Form State
    const [formData, setFormData] = useState({
        droneName: '',
        address: '',
        groupName: '',
        homePosition: { x: 0, y: 0, z: 0 }
    });

    const fetchDrones = async () => {
        if (!groupUUID) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/v1/drones/list/${groupUUID}`);
            const data = await res.json();
            setDrones(data);
        } catch (error) {
            console.error('Failed to fetch drones:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        try {
            await fetch('/api/v1/drones/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            setRegisterOpen(false);
            fetchDrones();

            // Reset form
            setFormData({
                droneName: '',
                address: '',
                groupName: '',
                homePosition: { x: 0, y: 0, z: 0 }
            });
        } catch (error) {
            console.error('Failed to register drone:', error);
        }
    };

    const handleUngroup = async (droneUUID: string) => {
        try {
            await fetch(`/api/v1/drones/${droneUUID}/ungroup/`, {
                method: 'PATCH'
            });
            fetchDrones();
        } catch (error) {
            console.error('Failed to ungroup drone:', error);
        }
    };

    const handleMoveGroup = async (droneUUID: string, newGroupUUID: string) => {
        try {
            await fetch(`/api/v1/drones/${droneUUID}/group/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ group_uuid: newGroupUUID })
            });
            fetchDrones();
        } catch (error) {
            console.error('Failed to move drone:', error);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0f1115] text-white font-sans overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-[1400px] mx-auto p-4 lg:p-6 space-y-6">

                    {/* Page Header */}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Drone Group Management</h1>
                        <p className="text-sm text-[#9da6b9] mt-1">Browse and manage drones by group</p>
                    </div>

                    {/* Group Selector */}
                    <Card className="bg-[#111318] border-[#282e39]">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="flex-1 space-y-2">
                                    <Label className="text-sm">Group UUID</Label>
                                    <Input
                                        placeholder="Enter group UUID..."
                                        value={groupUUID}
                                        onChange={(e) => setGroupUUID(e.target.value)}
                                        className="bg-[#1c1f27] border-[#3b4354] h-10"
                                    />
                                </div>
                                <Button
                                    onClick={fetchDrones}
                                    disabled={!groupUUID}
                                    className="bg-white text-black hover:bg-gray-200 h-10"
                                >
                                    <FolderOpen size={16} className="mr-2" />
                                    Load Group
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Drones Table */}
                    <Card className="bg-[#111318] border-[#282e39]">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Group Drones</CardTitle>
                                <CardDescription className="text-[#9da6b9]">
                                    {drones.length} drone{drones.length !== 1 ? 's' : ''} in this group
                                </CardDescription>
                            </div>

                            <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="bg-white text-black hover:bg-gray-200">
                                        <Plus size={16} className="mr-1" />
                                        Register Drone
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#111318] border-[#282e39] text-white">
                                    <DialogHeader>
                                        <DialogTitle>Register New Drone</DialogTitle>
                                        <DialogDescription className="text-[#9da6b9]">
                                            Add a new drone to the fleet
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Drone Name</Label>
                                            <Input
                                                value={formData.droneName}
                                                onChange={(e) => setFormData({ ...formData, droneName: e.target.value })}
                                                className="bg-[#1c1f27] border-[#3b4354]"
                                                placeholder="e.g. Falcon-01"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Address</Label>
                                            <Input
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="bg-[#1c1f27] border-[#3b4354]"
                                                placeholder="e.g. 192.168.1.100"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Group Name</Label>
                                            <Input
                                                value={formData.groupName}
                                                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                                                className="bg-[#1c1f27] border-[#3b4354]"
                                                placeholder="e.g. Alpha Squadron"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Home Position</Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <Input
                                                    type="number"
                                                    placeholder="X"
                                                    value={formData.homePosition.x}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        homePosition: { ...formData.homePosition, x: parseFloat(e.target.value) }
                                                    })}
                                                    className="bg-[#1c1f27] border-[#3b4354]"
                                                />
                                                <Input
                                                    type="number"
                                                    placeholder="Y"
                                                    value={formData.homePosition.y}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        homePosition: { ...formData.homePosition, y: parseFloat(e.target.value) }
                                                    })}
                                                    className="bg-[#1c1f27] border-[#3b4354]"
                                                />
                                                <Input
                                                    type="number"
                                                    placeholder="Z"
                                                    value={formData.homePosition.z}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        homePosition: { ...formData.homePosition, z: parseFloat(e.target.value) }
                                                    })}
                                                    className="bg-[#1c1f27] border-[#3b4354]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setRegisterOpen(false)} className="border-[#3b4354]">
                                            Cancel
                                        </Button>
                                        <Button onClick={handleRegister} className="bg-white text-black hover:bg-gray-200">
                                            Register
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-sm text-[#9da6b9] text-center py-8">Loading drones...</p>
                            ) : drones.length === 0 ? (
                                <p className="text-sm text-[#9da6b9] text-center py-8">No drones in this group. Select a group UUID above.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-[#282e39] hover:bg-transparent">
                                            <TableHead className="text-[#9da6b9]">Drone Name</TableHead>
                                            <TableHead className="text-[#9da6b9]">Address</TableHead>
                                            <TableHead className="text-[#9da6b9]">PX4 Version</TableHead>
                                            <TableHead className="text-[#9da6b9]">Group</TableHead>
                                            <TableHead className="text-right"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {drones.map((drone) => (
                                            <TableRow key={drone.uuid} className="border-[#282e39] hover:bg-[#1c1f27]">
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Plane size={16} className="text-[#135bec]" />
                                                        <span className="font-medium">{drone.droneName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm text-[#9da6b9]">
                                                    {drone.address}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-[#135bec]/10 text-[#135bec] border-[#135bec]/20">
                                                        {drone.px4Version || 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-[#9da6b9]">
                                                    {drone.groupName || 'Unassigned'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical size={16} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-[#1c1f27] border-[#282e39]">
                                                            <DropdownMenuItem
                                                                onClick={() => handleUngroup(drone.uuid)}
                                                                className="text-white hover:bg-[#282e39]"
                                                            >
                                                                <UserMinus size={14} className="mr-2" />
                                                                Ungroup
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-white hover:bg-[#282e39]">
                                                                Move to Group
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-white hover:bg-[#282e39]">
                                                                View Details
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}