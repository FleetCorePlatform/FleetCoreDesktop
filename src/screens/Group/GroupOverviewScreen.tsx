import {
    ArrowLeft, Plus, Settings, Battery, Signal,
    Trash2, AlertTriangle, Plane,
    Network, Server, Cpu, MapPin, Crosshair, Camera, Info, ScanEye, ArrowUpRightFromSquareIcon, Pen, Edit, Edit2,
    Edit3Icon, Edit2Icon, Cog, SeparatorHorizontal, Construction
} from 'lucide-react';
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { apiCall } from "@/utils/api.ts";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {EditControl} from "react-leaflet-draw";
import {ChangePassword} from "@aws-amplify/ui-react/dist/types/components/AccountSettings/ChangePassword";
import {Separator} from "radix-ui";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface DroneSummaryModel {
    uuid: string,
    name: string
    group_name: string,
    address: string,
    manager_version: string,
    first_discovered: string,
    home_position: { x: number; y: number; z: number },
    maintenance: boolean,
    remaining_percent: number | null,
    inFlight: boolean
}

interface RegisterDroneRequest {
    groupName: string;
    droneName: string;
    address: string;
    px4Version: string;
    agentVersion: string;
    homePosition: {
        x: number;
        y: number;
        z: number;
    };
}

const PUBLIC_IP_REGEX = /^(?!10\.)(?!172\.(1[6-9]|2[0-9]|3[0-1])\.)(?!192\.168\.)(?!127\.)(?!169\.254\.)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const AVAILABLE_GROUPS = ["alpha-squad", "bravo-squad", "recon-1", "logistics-a"];

function LocationSelector({ position, onLocationSelect }: { position: { lat: number, lng: number } | null, onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position ? <Marker position={position} /> : null;
}

export default function GroupOverviewScreen() {
    const { groupUuid, outpostUuid } = useParams<{ groupUuid: string; outpostUuid: string; }>();
    const navigate = useNavigate();

    const [drones, setDrones] = useState<DroneSummaryModel[]>([]);
    const [loading, setLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDrone, setEditingDrone] = useState<DroneSummaryModel | null>(null);
    const [editField, setEditField] = useState<'address' | 'name' | 'version' | 'group' | null>(null);
    const [editValue, setEditValue] = useState("");
    const [error, setError] = useState<string | null>(null);

    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [regForm, setRegForm] = useState({
        name: '',
        group: AVAILABLE_GROUPS[0],
        address: '',
        px4: 'v1.14.0',
        agent: 'v2.5.1',
        altitude: '50',
        home: null as { lat: number, lng: number } | null
    });
    const [regError, setRegError] = useState<string | null>(null);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");

    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraDrone, setCameraDrone] = useState<DroneSummaryModel | null>(null);
    const [streamActive, setStreamActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
    const [maintenanceDrone, setMaintenanceDrone] = useState<DroneSummaryModel | null>(null);
    const [maintenanceForm, setMaintenanceForm] = useState({
        type: 'Routine Inspection',
        description: ''
    });
    const [maintenanceLoading, setMaintenanceLoading] = useState(false);

    const MAINTENANCE_TYPES = [
        "Routine Inspection",
        "Firmware Update",
        "Motor Repair",
        "Sensor Calibration",
        "Battery Replacement",
        "Structural Repair"
    ];

    const openMaintenanceModal = (drone: DroneSummaryModel) => {
        setMaintenanceDrone(drone);
        setMaintenanceForm({ type: MAINTENANCE_TYPES[0], description: '' });
        setIsMaintenanceOpen(true);
    };

    const handleCreateMaintenance = async () => {
        if (!maintenanceDrone || !maintenanceForm.description) return;

        setMaintenanceLoading(true);
        try {
            await apiCall('/api/v1/maintenance', undefined, "POST", {
                droneUuid: maintenanceDrone.uuid,
                type: maintenanceForm.type,
                description: maintenanceForm.description
            });

            await new Promise(resolve => setTimeout(resolve, 500));

            setIsMaintenanceOpen(false);
            navigate(`/maintenance/${outpostUuid}`);
        } catch (e) {
            console.error("Failed to create maintenance record", e);
        } finally {
            setMaintenanceLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const dronesSummary: Array<DroneSummaryModel> = await apiCall(
                    `/api/v1/groups?group_uuid=${groupUuid}&limit=10`, undefined,
                    "GET"
                );
                setDrones(dronesSummary);

            } catch (error) {
                console.error("Failed to fetch group details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [groupUuid, outpostUuid]);

    useEffect(() => {
        if (isCameraOpen && videoRef.current) {
            console.log("Initializing WebRTC Player for", cameraDrone?.uuid);
        }
    }, [isCameraOpen, cameraDrone]);

    useEffect(() => {
        if (!isCameraOpen) {
            setStreamActive(false);
        }
    }, [isCameraOpen]);

    const toggleStream = () => {
        if (streamActive) {
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setStreamActive(false);
        } else {
            setStreamActive(true);
        }
    };

    const getBadgeColor = (status: DroneSummaryModel) => {
        if (!status.inFlight && status.maintenance) {
            return 'text-red-400 bg-red-400/10 border-red-400/20';
        }
        if (status.inFlight) {
            return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        }
        if (status.maintenance) {
            return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
        }
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    };

    const targetGroupName = drones.length > 0 ? drones[0].group_name : "this group";
    const pageTitle = drones.length > 0 ? drones[0].group_name : "Unknown Group";
    const firmwareVersion = drones.length > 0 ? drones[0].manager_version : "N/A";

    const handleDeleteClick = () => {
        setDeleteInput("");
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteInput !== targetGroupName) return;
        setIsDeleteOpen(false);
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate(`/outposts/${outpostUuid}`);
    };

    const handleRegister = async () => {
        if (!regForm.name || !regForm.address) {
            setRegError("Name and Address are required.");
            return;
        }
        if (!PUBLIC_IP_REGEX.test(regForm.address)) {
            setRegError("Invalid Public IP Address.");
            return;
        }
        if (!regForm.home) {
            setRegError("Please select a Home Position on the map.");
            return;
        }

        const payload: RegisterDroneRequest = {
            groupName: regForm.group,
            droneName: regForm.name,
            address: regForm.address,
            px4Version: regForm.px4,
            agentVersion: regForm.agent,
            homePosition: {
                x: regForm.home.lng,
                y: regForm.home.lat,
                z: parseFloat(regForm.altitude) || 0
            }
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const newDrone: DroneSummaryModel = {
                uuid: `new-${Date.now()}`,
                name: payload.droneName,
                group_name: payload.groupName,
                address: payload.address,
                manager_version: payload.agentVersion,
                first_discovered: new Date().toISOString(),
                home_position: { x: payload.homePosition.x, y: payload.homePosition.y, z: payload.homePosition.z },
                maintenance: false,
                remaining_percent: 100,
                inFlight: false
            };
            setDrones([...drones, newDrone]);
            setIsRegisterOpen(false);
            setRegError(null);
            setRegForm({
                name: '', group: AVAILABLE_GROUPS[0], address: '',
                px4: 'v1.14.0', agent: 'v2.5.1', altitude: '50', home: null
            });
        } catch (e) {
            setRegError("Failed to register drone.");
        }
    };

    const openEditModal = (drone: DroneSummaryModel, field: 'address' | 'name' | 'version' | 'group') => {
        setEditingDrone(drone);
        setEditField(field);
        setError(null);

        switch (field) {
            case 'address': setEditValue(drone.address); break;
            case 'name': setEditValue(drone.name); break;
            case 'version': setEditValue(drone.manager_version); break;
            case 'group': setEditValue(drone.group_name || AVAILABLE_GROUPS[0]); break;
        }
        setIsDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingDrone || !editField) return;

        if (editField === 'address') {
            if (!PUBLIC_IP_REGEX.test(editValue)) {
                setError("Invalid Public IP Address (Private ranges not allowed).");
                return;
            }
        }

        setDrones(prev => prev.map(d => {
            if (d.uuid === editingDrone.uuid) {
                return {
                    ...d,
                    [editField === 'version' ? 'manager_version' :
                        editField === 'group' ? 'group_name' : editField]: editValue
                };
            }
            return d;
        }));

        setIsDialogOpen(false);
    };

    const openCamera = (drone: DroneSummaryModel) => {
        setCameraDrone(drone);
        setIsCameraOpen(true);
    }

    if (loading) {
        return <div className="p-8 text-center text-[hsl(var(--text-secondary))]">Loading fleet data...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            <div className="flex-1 overflow-auto">
                <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">

                    {/* --- Header & Navigation --- */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={`/outposts/${outpostUuid}`}>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-secondary))]">
                                    <ArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
                                    <Badge variant="outline" className="text-[hsl(var(--text-muted))] border-[hsl(var(--border-primary))] font-mono">
                                        {(groupUuid || "").substring(0, 8)}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))] mt-1">
                                    <Server size={14} />
                                    <span>Assigned to Outpost: {(outpostUuid || "").substring(0, 8)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <Button
                                variant="destructive"
                                onClick={handleDeleteClick}
                                className="flex-1 md:flex-none h-9 bg-red-500/10 text-red-200 border border-red-500/30 hover:bg-red-500/20 hover:text-white transition-colors"
                            >
                                <Trash2 size={16} className="mr-2" />
                                Delete Group
                            </Button>

                            <Button
                                onClick={() => setIsRegisterOpen(true)}
                                className="flex-1 md:flex-none bg-white text-black hover:bg-gray-200 h-9"
                            >
                                <Plus size={16} className="mr-2" />
                                Register Drone
                            </Button>
                        </div>
                    </div>

                    {/* --- KPI Cards --- */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Total Units</p>
                                    <h3 className="text-2xl font-bold mt-1">{drones.length}</h3>
                                </div>
                                <div className="p-2 bg-[hsl(var(--bg-tertiary))] rounded-lg text-white/70">
                                    <Plane size={20} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Available</p>
                                    <h3 className="text-2xl font-bold mt-1 text-emerald-400">
                                        {drones.filter(d => !d.maintenance).length}
                                    </h3>
                                </div>
                                <div className="p-2 bg-[hsl(var(--bg-tertiary))] rounded-lg text-emerald-400">
                                    <Signal size={20} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Firmware Version</p>
                                    <h3 className="text-lg font-bold mt-1 font-mono text-[hsl(var(--text-primary))]">{firmwareVersion}</h3>
                                </div>
                                <div className="p-2 bg-[hsl(var(--bg-tertiary))] rounded-lg text-blue-400">
                                    <Cpu size={20} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">Maintenance</p>
                                    <h3 className="text-2xl font-bold mt-1 text-red-400">
                                        {drones.filter(d => d.maintenance).length}
                                    </h3>
                                </div>
                                <div className="p-2 bg-[hsl(var(--bg-tertiary))] rounded-lg text-red-400">
                                    <AlertTriangle size={20} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- Drone Roster --- */}
                    <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                        <CardHeader className="border-b border-[hsl(var(--border-primary))] pb-4">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <CardTitle className="text-lg font-medium">Fleet Registry</CardTitle>
                                    <CardDescription className="text-[hsl(var(--text-muted))]">
                                        Manage drone registration and telemetry.
                                    </CardDescription>
                                </div>
                                <Input
                                    placeholder="Filter by UUID or Name..."
                                    className="w-full md:w-64 h-9 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-[hsl(var(--bg-tertiary))]">
                                        <TableRow className="hover:bg-transparent border-[hsl(var(--border-primary))]">
                                            <TableHead className="w-[200px]">Identity</TableHead>
                                            <TableHead>Network Address</TableHead>
                                            <TableHead>Agent</TableHead>
                                            <TableHead>Home Position</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Battery</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {drones.map((drone) => (
                                            <TableRow key={drone.uuid} className="border-[hsl(var(--border-primary))] hover:bg-[hsl(var(--bg-tertiary))]/50">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-[hsl(var(--text-primary))]">{drone.name}</span>
                                                        <span className="text-xs font-mono text-[hsl(var(--text-muted))]">{drone.uuid.substring(0, 8)}...</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm font-mono text-[hsl(var(--text-secondary))]">
                                                        <Network size={14} />
                                                        {drone.address}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[hsl(var(--text-muted))] w-8">Agent:</span>
                                                            <span className="font-mono text-[hsl(var(--text-secondary))]">{drone.manager_version}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {drone.home_position ? (
                                                        <div className="flex items-center gap-2 text-xs font-mono text-[hsl(var(--text-secondary))]">
                                                            <MapPin size={14} />
                                                            X:{drone.home_position.x}, Y:{drone.home_position.y}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-[hsl(var(--text-muted))] italic">Not Set</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={`capitalize font-normal border ${getBadgeColor(drone)}`}>
                                                        {drone.maintenance ? "Maintenance" : drone.inFlight ? "In Flight" : "Ready"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="w-[150px]">
                                                    <div className="flex items-center gap-3">
                                                        <Battery size={16} className={drone.remaining_percent != null && drone.remaining_percent < 20 ? "text-red-400" : "text-[hsl(var(--text-secondary))]"} />
                                                        {drone.remaining_percent != null ? (
                                                            <>
                                                                <Progress value={drone.remaining_percent} className="h-1.5 w-full bg-[hsl(var(--bg-tertiary))]" />
                                                                <span className="text-xs font-mono w-8 text-right">{drone.remaining_percent}%</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs font-mono text-[hsl(var(--text-secondary))]">N/A</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openCamera(drone)}
                                                            className="h-8 w-8 p-0 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]"
                                                            title="View Camera Feed"
                                                        >
                                                            <ScanEye size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate(`/drones/${drone.uuid}`)}
                                                            className="h-8 w-8 p-0 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]"
                                                            title="View details"
                                                        >
                                                            <ArrowUpRightFromSquareIcon size={14} />
                                                        </Button>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button title="Edit properties" variant="ghost" size="sm" className="h-8 w-8 p-0 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]">
                                                                    <Cog size={14} />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-56 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))]">
                                                                <DropdownMenuItem onClick={() => openEditModal(drone, 'address')} className="cursor-pointer focus:bg-[hsl(var(--text-primary))]/10 focus:text-[hsl(var(--text-primary))]">
                                                                    Change Address
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => openEditModal(drone, 'name')} className="cursor-pointer focus:bg-[hsl(var(--text-primary))]/10 focus:text-[hsl(var(--text-primary))]">
                                                                    Change Name
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => openEditModal(drone, 'version')} className="cursor-pointer focus:bg-[hsl(var(--text-primary))]/10 focus:text-[hsl(var(--text-primary))]">
                                                                    Change Agent Version
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => openEditModal(drone, 'group')} className="cursor-pointer focus:bg-[hsl(var(--text-primary))]/10 focus:text-[hsl(var(--text-primary))]">
                                                                    Change Group
                                                                </DropdownMenuItem>

                                                                <DropdownMenuSeparator className="bg-[hsl(var(--border-primary))]/50 my-1" />

                                                                <DropdownMenuItem
                                                                    onClick={() => openMaintenanceModal(drone)}
                                                                    className="cursor-pointer text-amber-500 focus:text-amber-400 focus:bg-amber-500/10 flex items-center gap-2"
                                                                >
                                                                    <Construction size={14} />
                                                                    <span>Register maintenance</span>
                                                                </DropdownMenuItem>

                                                                <DropdownMenuItem
                                                                    onClick={() => {}}
                                                                    className="cursor-pointer text-red-500 focus:text-red-400 focus:bg-red-500/10 flex items-center gap-2"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    <span>Decommission drone</span>
                                                                </DropdownMenuItem>

                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- Create Maintenance Dialog --- */}
            <Dialog open={isMaintenanceOpen} onOpenChange={setIsMaintenanceOpen}>
                <DialogContent className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Construction size={18} className="text-amber-500" />
                            Schedule Maintenance
                        </DialogTitle>
                        <DialogDescription className="text-[hsl(var(--text-secondary))]">
                            Create a new maintenance ticket for <span className="font-mono font-medium text-[hsl(var(--text-primary))]">{maintenanceDrone?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 py-4">
                        {/* Drone Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-[hsl(var(--text-muted))]">Target Drone</Label>
                                <div className="text-sm font-medium border border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-tertiary))]/50 px-3 py-2 rounded-md">
                                    {maintenanceDrone?.name}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-[hsl(var(--text-muted))]">UUID</Label>
                                <div className="text-sm font-mono border border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-tertiary))]/50 px-3 py-2 rounded-md truncate">
                                    {maintenanceDrone?.uuid}
                                </div>
                            </div>
                        </div>

                        {/* Maintenance Type */}
                        <div className="space-y-2">
                            <Label htmlFor="maint-type">Maintenance Type</Label>
                            <Select
                                value={maintenanceForm.type}
                                onValueChange={(val) => setMaintenanceForm({...maintenanceForm, type: val})}
                            >
                                <SelectTrigger id="maint-type" className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]">
                                    {MAINTENANCE_TYPES.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="maint-desc">Description & Notes</Label>
                            <textarea
                                id="maint-desc"
                                className="flex min-h-[100px] w-full rounded-md border border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-tertiary))] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Describe the issue or required task..."
                                value={maintenanceForm.description}
                                onChange={(e) => setMaintenanceForm({...maintenanceForm, description: e.target.value})}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsMaintenanceOpen(false)}
                            disabled={maintenanceLoading}
                            className="border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateMaintenance}
                            disabled={maintenanceLoading || !maintenanceForm.description}
                            className="bg-amber-600 text-white hover:bg-amber-700"
                        >
                            {maintenanceLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                    Creating...
                                </span>
                            ) : (
                                "Create Ticket"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- Registration Dialog --- */}
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogContent className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Register New Drone</DialogTitle>
                        <DialogDescription className="text-[hsl(var(--text-secondary))]">
                            Enter the telemetry details and home position to onboard a new unit.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="reg-name">Drone Name</Label>
                                <Input
                                    id="reg-name"
                                    placeholder="e.g. Unit-734"
                                    value={regForm.name}
                                    onChange={e => setRegForm({...regForm, name: e.target.value})}
                                    className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg-group">Target Group</Label>
                                <Select value={regForm.group} onValueChange={v => setRegForm({...regForm, group: v})}>
                                    <SelectTrigger className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]">
                                        <SelectValue placeholder="Select group" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]">
                                        {AVAILABLE_GROUPS.map(g => (
                                            <SelectItem key={g} value={g}>{g}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="reg-address">Network Address</Label>
                                <div className="relative">
                                    <Network className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--text-muted))]" />
                                    <Input
                                        id="reg-address"
                                        placeholder="Public IPv4"
                                        value={regForm.address}
                                        onChange={e => setRegForm({...regForm, address: e.target.value})}
                                        className="pl-9 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="space-y-2">
                                    <Label htmlFor="reg-agent">Agent Version</Label>
                                    <Input
                                        id="reg-agent"
                                        value={regForm.agent}
                                        onChange={e => setRegForm({...regForm, agent: e.target.value})}
                                        className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Home Position</Label>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="reg-alt" className="text-xs font-normal text-[hsl(var(--text-muted))]">Altitude (m):</Label>
                                    <Input
                                        id="reg-alt"
                                        className="w-20 h-7 text-xs bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]"
                                        value={regForm.altitude}
                                        onChange={e => setRegForm({...regForm, altitude: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="h-[250px] w-full rounded-md border border-[hsl(var(--border-primary))] overflow-hidden relative">
                                <MapContainer center={[40.75, -73.98]} zoom={12} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                    <LocationSelector position={regForm.home} onLocationSelect={(lat, lng) => setRegForm({...regForm, home: {lat, lng}})} />
                                </MapContainer>
                                {!regForm.home && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                                        <div className="bg-black/70 px-3 py-1.5 rounded-full text-xs text-white flex items-center gap-2">
                                            <Crosshair size={14} />
                                            Click map to set home
                                        </div>
                                    </div>
                                )}
                            </div>
                            {regForm.home && (
                                <p className="text-xs font-mono text-[hsl(var(--text-secondary))] text-right">
                                    Lat: {regForm.home.lat.toFixed(6)}, Lng: {regForm.home.lng.toFixed(6)}
                                </p>
                            )}
                        </div>
                        {regError && (
                            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2">
                                <AlertTriangle size={16} />
                                {regError}
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsRegisterOpen(false)} className="border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]">Cancel</Button>
                        <Button onClick={handleRegister} className="bg-white text-black hover:bg-gray-200">Register Unit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- Delete Confirmation Dialog --- */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-400 flex items-center gap-2">
                            <AlertTriangle size={20} />
                            Delete Group
                        </DialogTitle>
                        <DialogDescription className="text-[hsl(var(--text-secondary))] pt-2">
                            This action cannot be undone. This will permanently delete the group <span className="text-[hsl(var(--text-primary))] font-medium">{targetGroupName}</span> and decommission all associated drones.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs">
                                Please type <span className="font-mono text-red-400 font-bold">{targetGroupName}</span> to confirm.
                            </Label>
                            <Input
                                value={deleteInput}
                                onChange={(e) => setDeleteInput(e.target.value)}
                                className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]"
                                placeholder={targetGroupName}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            className="border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleteInput !== targetGroupName}
                            className="flex-1 md:flex-none h-9 bg-red-500/20 text-red-200 border border-red-500/50 hover:bg-red-500/30 hover:text-white transition-colors"
                        >
                            Delete Group
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- Camera Feed Modal --- */}
            <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                <DialogContent className="bg-black/95 border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] sm:max-w-[800px] p-0 overflow-hidden">
                    <DialogHeader className="p-4 bg-[hsl(var(--bg-secondary))] border-b border-[hsl(var(--border-primary))]">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <DialogTitle className="flex items-center gap-2">
                                    <Camera size={16} />
                                    Live Feed: {cameraDrone?.name}
                                </DialogTitle>
                                <DialogDescription className="text-xs font-mono text-[hsl(var(--text-muted))]">
                                    UUID: {cameraDrone?.uuid} • IP: {cameraDrone?.address}
                                </DialogDescription>
                            </div>
                            {streamActive ? (
                                <Badge variant="outline" className="text-red-500 border-red-500/50 bg-red-500/10 animate-pulse">
                                    LIVE SIGNAL
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 bg-yellow-500/10">
                                    OFFLINE
                                </Badge>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="aspect-video w-full relative bg-[#1a1a1a] group overflow-hidden">
                        {streamActive ? (
                            <>
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-contain"
                                    controls
                                    autoPlay
                                    playsInline
                                    muted
                                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                                />

                                <div className="absolute inset-0 pointer-events-none opacity-50">
                                    <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-white/20"></div>
                                    <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-white/20"></div>
                                    <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-white/20"></div>
                                    <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-white/20"></div>

                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8">
                                        <div className="absolute w-full h-[1px] bg-white/30 top-1/2"></div>
                                        <div className="absolute h-full w-[1px] bg-white/30 left-1/2"></div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                {/* Grid Background */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                                <div className="z-10 text-center space-y-4">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black tracking-widest text-[hsl(var(--text-muted))] opacity-30 select-none">NO SIGNAL</h2>
                                        <p className="text-xs text-[hsl(var(--text-muted))] font-mono">ESTABLISH UPLINK TO VIEW FEED</p>
                                    </div>
                                    <Button
                                        onClick={toggleStream}
                                        variant="outline"
                                        className="bg-white/5 border-white/10 hover:bg-white/10 text-white hover:text-white"
                                    >
                                        <Signal className="mr-2 h-4 w-4" />
                                        Initialize Stream
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-2 bg-black border-t border-[hsl(var(--border-primary))]">
                        <div className="w-full flex justify-between items-center text-xs font-mono text-[hsl(var(--text-muted))] px-2">
                            <span>PROTOCOL: WEBRTC</span>
                            <span>
                    STATUS: <span className={streamActive ? "text-emerald-500" : "text-yellow-500"}>
                        {streamActive ? "CONNECTED (52ms)" : "STANDBY"}
                    </span>
                 </span>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit {editField === 'version' ? 'Agent Version' : editField ? editField.charAt(0).toUpperCase() + editField.slice(1) : ''}</DialogTitle>
                        <DialogDescription className="text-[hsl(var(--text-secondary))]">
                            Update the {editField} for drone <span className="font-mono">{editingDrone?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-value" className="text-[hsl(var(--text-secondary))]">
                                {editField === 'address' ? 'Public IP Address' :
                                    editField === 'group' ? 'Target Group' :
                                        editField === 'version' ? 'Version Tag' : 'New Name'}
                            </Label>

                            {editField === 'group' ? (
                                <Select value={editValue} onValueChange={setEditValue}>
                                    <SelectTrigger className="w-full bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))]">
                                        <SelectValue placeholder="Select a group" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))]">
                                        {AVAILABLE_GROUPS.map(g => (
                                            <SelectItem key={g} value={g} className="focus:bg-[hsl(var(--text-primary))]/10 focus:text-[hsl(var(--text-primary))]">{g}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    id="edit-value"
                                    value={editValue}
                                    onChange={(e) => {
                                        setEditValue(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    className={`bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] ${error ? 'border-red-500' : ''}`}
                                />
                            )}

                            {error && (
                                <p className="text-xs text-red-400 mt-1">{error}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]">
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} className="bg-white text-black hover:bg-gray-200">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}