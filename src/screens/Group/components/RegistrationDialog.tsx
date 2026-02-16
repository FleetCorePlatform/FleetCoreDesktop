import {
    CheckCircle2, Key, FileText, ShieldCheck, Download, Info,
    Network, ScanEye, Crosshair, AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Badge } from "@/components/ui/badge.tsx";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import {AVAILABLE_CAPABILITIES, RegisteredDroneResponse} from "../types";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationSelector({ position, onLocationSelect }: { position: { lat: number, lng: number } | null, onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position ? <Marker position={position} /> : null;
}

export interface RegFormState {
    name: string;
    group: string;
    address: string;
    px4: string;
    agent: string;
    altitude: string;
    home: { lat: number, lng: number } | null;
    model: string;
    capabilities: string[];
}

interface RegistrationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    regForm: RegFormState;
    setRegForm: (form: RegFormState) => void;
    targetGroupName: string;
    onRegister: () => void;
    registeredDroneResponse: RegisteredDroneResponse | null;
    regError: string | null;
    onFinish: () => void;
    saveFile: (filename: string, content: string) => void;
}

export function RegistrationDialog({
    open,
    onOpenChange,
    regForm,
    setRegForm,
    targetGroupName,
    onRegister,
    registeredDroneResponse,
    regError,
    onFinish,
    saveFile
}: RegistrationDialogProps) {

    const toggleCapability = (cap: string) => {
        const caps = regForm.capabilities.includes(cap)
            ? regForm.capabilities.filter(c => c !== cap)
            : [...regForm.capabilities, cap];
        setRegForm({ ...regForm, capabilities: caps });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] sm:max-w-[650px] max-h-[90vh] overflow-y-auto">

                {registeredDroneResponse ? (
                    <div className="flex flex-col items-center justify-center py-4 space-y-6">
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle2 size={32} className="text-emerald-500" />
                            </div>
                            <DialogTitle className="text-2xl text-emerald-500">Registration Successful</DialogTitle>
                            <DialogDescription className="text-[hsl(var(--text-secondary))] max-w-md">
                                Drone <span className="text-[hsl(var(--text-primary))] font-mono">{regForm.name}</span> has been provisioned.
                                You must now install these credentials on the device.
                            </DialogDescription>
                        </div>

                        <div className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-4 space-y-4">
                            <h4 className="text-sm font-medium text-[hsl(var(--text-muted))] uppercase tracking-wider">Required Downloads</h4>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center justify-between p-3 bg-[hsl(var(--bg-secondary))] rounded-md border border-[hsl(var(--border-primary))]">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-500/10 rounded text-amber-500">
                                            <Key size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">Private Key</span>
                                            <span className="text-xs text-[hsl(var(--text-muted))] font-mono">private.key</span>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-2 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-500"
                                        onClick={() => saveFile(`${registeredDroneResponse.createdDroneUuid}-private.key`, registeredDroneResponse.certs.privateKey)}
                                    >
                                        <Download size={14} /> Download
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-[hsl(var(--bg-secondary))] rounded-md border border-[hsl(var(--border-primary))]">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded text-blue-500">
                                            <FileText size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">Certificate PEM</span>
                                            <span className="text-xs text-[hsl(var(--text-muted))] font-mono">cert.pem</span>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-2 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-500"
                                        onClick={() => saveFile(`${registeredDroneResponse.createdDroneUuid}-cert.pem`, registeredDroneResponse.certs.certificatePEM)}
                                    >
                                        <Download size={14} /> Download
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-[hsl(var(--bg-secondary))] rounded-md border border-[hsl(var(--border-primary))]">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/10 rounded text-purple-500">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">AWS IoT ARN</span>
                                            <span className="text-xs text-[hsl(var(--text-muted))] font-mono truncate max-w-[200px]" title={registeredDroneResponse.certs.certificateARN}>
                                                {registeredDroneResponse.certs.certificateARN}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-md">
                                <p className="text-xs text-amber-500/80 flex gap-2">
                                    <Info size={16} className="shrink-0" />
                                    <span>
                                        These credentials will appear only once. Download them immediately and transfer them to the <code>/etc/fleetcore/certs</code> directory on the drone.
                                    </span>
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="w-full sm:justify-center">
                            <Button
                                size="lg"
                                onClick={onFinish}
                                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px]"
                            >
                                Finish registration
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Register New Drone</DialogTitle>
                            <DialogDescription className="text-[hsl(var(--text-secondary))]">
                                Enter the telemetry details, hardware specs, and home position.
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
                                        onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                                        className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-group">Target Group</Label>
                                    <Input
                                        id="reg-name"
                                        disabled={true}
                                        value={targetGroupName}
                                        className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]"
                                    />
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
                                            onChange={e => setRegForm({ ...regForm, address: e.target.value })}
                                            className="pl-9 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-model">Hardware Model</Label>
                                    <Input
                                        id="reg-model"
                                        placeholder="e.g. typhoon"
                                        value={regForm.model}
                                        onChange={e => setRegForm({ ...regForm, model: e.target.value })}
                                        className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                <div className="space-y-2">
                                    <Label htmlFor="reg-agent">Agent Version</Label>
                                    <Input
                                        id="reg-agent"
                                        value={regForm.agent}
                                        onChange={e => setRegForm({ ...regForm, agent: e.target.value })}
                                        className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>System Capabilities</Label>
                                <div className="flex flex-wrap gap-2 p-3 border border-[hsl(var(--border-primary))] rounded-md bg-[hsl(var(--bg-tertiary))]/30">
                                    {AVAILABLE_CAPABILITIES.map((cap) => {
                                        const isSelected = regForm.capabilities.includes(cap);
                                        return (
                                            <Badge
                                                key={cap}
                                                variant={isSelected ? "default" : "outline"}
                                                onClick={() => toggleCapability(cap)}
                                                className={`
                                                        cursor-pointer transition-all select-none
                                                        ${isSelected
                                                        ? "bg-amber-500 hover:bg-amber-600 text-black border-transparent"
                                                        : "bg-transparent text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:border-[hsl(var(--text-primary))]"
                                                    }
                                                    `}
                                            >
                                                {isSelected && <ScanEye size={12} className="mr-1.5" />}
                                                {cap}
                                            </Badge>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-[hsl(var(--text-muted))] text-right">
                                    {regForm.capabilities.length} capabilities selected
                                </p>
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
                                            onChange={e => setRegForm({ ...regForm, altitude: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="h-[200px] w-full rounded-md border border-[hsl(var(--border-primary))] overflow-hidden relative">
                                    <MapContainer center={[40.75, -73.98]} zoom={12} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                        <LocationSelector position={regForm.home} onLocationSelect={(lat, lng) => setRegForm({ ...regForm, home: { lat, lng } })} />
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
                            </div>

                            {regError && (
                                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2">
                                    <AlertTriangle size={16} />
                                    {regError}
                                </div>
                            )}
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]">Cancel</Button>
                            <Button onClick={onRegister} className="bg-white text-black hover:bg-gray-200">Register Unit</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
