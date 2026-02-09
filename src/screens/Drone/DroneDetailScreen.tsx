import {Canvas, useFrame} from "@react-three/fiber";
import { useGLTF, PresentationControls, Html } from "@react-three/drei";
import {Suspense, useEffect, useRef, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Activity, Battery, Signal,
    Cpu, Wifi, Shield,
    Camera, Navigation, Thermometer
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import * as THREE from 'three'

export function DroneModel() {
    const { nodes } = useGLTF('/models/typhoon.model.glb')
    const meshRef = useRef<THREE.Mesh>(null)

        useEffect(() => {
        if (meshRef.current) {
            meshRef.current.matrixAutoUpdate = false
            meshRef.current.updateMatrix()
        }
    }, [])

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.05
            meshRef.current.updateMatrix()
        }
    })

    return (
        <mesh
            ref={meshRef}
            geometry={nodes.mesh_0.geometry}
            material={nodes.mesh_0.material}
        />
    )
}

useGLTF.preload("/models/typhoon.model.glb");

function Loader() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2 text-[hsl(var(--text-primary))]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-xs font-mono uppercase tracking-widest">Loading Asset...</span>
            </div>
        </Html>
    );
}

export default function DroneDetailsScreen() {
    const { droneUuid } = useParams<{ droneUuid: string }>();
    const navigate = useNavigate();
    const [drone, setDrone] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const capabilities = [
        { icon: Navigation, label: "GPS/RTK", value: "M8P Gen 2" },
        { icon: Camera, label: "Optical Flow", value: "CX-700" },
        { icon: Wifi, label: "Telemetry", value: "SiK 900MHz" },
        { icon: Shield, label: "Obstacle Avoidance", value: "LiDAR Lite v3" },
        { icon: Thermometer, label: "Thermal", value: "Flir Boson" },
        { icon: Cpu, label: "Compute", value: "Raspberry Pi CM4" },
    ];

    useEffect(() => {
        const mockFetch = async () => {
            setLoading(true);
            await new Promise(r => setTimeout(r, 600));
            setDrone({
                uuid: droneUuid,
                name: "Unit-734",
                group: "alpha-squad",
                status: "Ready",
                battery: 82,
                signal: 94,
                flightTime: "142h 12m"
            });
            setLoading(false);
        };
        mockFetch();
    }, [droneUuid]);

    if (loading) return <div className="h-screen w-full bg-[hsl(var(--bg-primary))] flex items-center justify-center text-[hsl(var(--text-secondary))]">Initializing telemetry...</div>;

    return (
        <div className="flex flex-col h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[hsl(var(--border-primary))] flex items-center gap-4 bg-[hsl(var(--bg-secondary))]">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-[hsl(var(--bg-tertiary))]">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        {drone.name}
                        <Badge variant="outline" className="font-mono text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                            ONLINE
                        </Badge>
                    </h1>
                    <p className="text-xs font-mono text-[hsl(var(--text-secondary))]">UUID: {drone.uuid}</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left: 3D Viewport */}
                <div className="flex-1 bg-black/40 relative min-h-[400px]">
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        <Badge variant="secondary" className="bg-black/50 text-white border-white/10 backdrop-blur-md">
                            Interactive View
                        </Badge>
                    </div>

                    <Canvas
                        shadows
                        dpr={[1, 1]}
                        camera={{ fov: 45, position: [0, 0, 4] }}
                        gl={{
                            antialias: false,
                            powerPreference: "high-performance",
                            stencil: false,
                            depth: true
                        }}
                    >
                        <Suspense fallback={<Loader />}>
                            <PresentationControls speed={1.5} global zoom={0.7} polar={[-0.1, Math.PI / 4]}>
                                <ambientLight intensity={0.5} />
                                <directionalLight position={[10, 10, 5]} intensity={1} />

                                <DroneModel />
                            </PresentationControls>
                        </Suspense>
                    </Canvas>

                    <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-6 pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-gray-400 uppercase">Pitch</span>
                                <span className="text-sm font-mono font-bold text-white">0°</span>
                            </div>
                            <Separator orientation="vertical" className="h-6 bg-white/20" />
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-gray-400 uppercase">Roll</span>
                                <span className="text-sm font-mono font-bold text-white">0°</span>
                            </div>
                            <Separator orientation="vertical" className="h-6 bg-white/20" />
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-gray-400 uppercase">Yaw</span>
                                <span className="text-sm font-mono font-bold text-white">N 12°</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Details Panel */}
                <div className="w-full lg:w-[450px] bg-[hsl(var(--bg-secondary))] border-l border-[hsl(var(--border-primary))] overflow-y-auto p-6 space-y-6">

                    {/* Status Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <Card className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded bg-emerald-500/10 text-emerald-400">
                                    <Battery size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-[hsl(var(--text-secondary))]">Battery Level</p>
                                    <p className="text-lg font-bold">{drone.battery}%</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded bg-blue-500/10 text-blue-400">
                                    <Signal size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-[hsl(var(--text-secondary))]">Link Quality</p>
                                    <p className="text-lg font-bold">{drone.signal}%</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* System Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-[hsl(var(--text-secondary))] flex items-center gap-2">
                            <Activity size={14} /> System Health
                        </h3>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>CPU Load</span>
                                    <span className="font-mono">12%</span>
                                </div>
                                <Progress value={12} className="h-1.5 bg-[hsl(var(--bg-tertiary))]" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Memory Usage</span>
                                    <span className="font-mono">458MB / 4GB</span>
                                </div>
                                <Progress value={24} className="h-1.5 bg-[hsl(var(--bg-tertiary))]" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Storage</span>
                                    <span className="font-mono">12GB Free</span>
                                </div>
                                <Progress value={68} className="h-1.5 bg-[hsl(var(--bg-tertiary))]" />
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-[hsl(var(--border-primary))]" />

                    {/* Hardware Capabilities */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-[hsl(var(--text-secondary))] flex items-center gap-2">
                            <Cpu size={14} /> Hardware Configuration
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {capabilities.map((cap, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-md border border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-tertiary))]/50">
                                    <div className="flex items-center gap-3">
                                        <cap.icon size={16} className="text-[hsl(var(--text-muted))]" />
                                        <span className="text-sm font-medium">{cap.label}</span>
                                    </div>
                                    <span className="text-xs font-mono text-[hsl(var(--text-secondary))]">{cap.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button className="w-full bg-white text-black hover:bg-gray-200">
                            Run Diagnostics
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}