import { useRef, useState, useEffect } from "react";
import { DroneSummaryModel } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Camera, Signal } from 'lucide-react';

interface CameraDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    drone: DroneSummaryModel | null;
}

export function CameraDialog({ open, onOpenChange, drone }: CameraDialogProps) {
    const [streamActive, setStreamActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (open && videoRef.current) {
            console.log("Initializing WebRTC Player for", drone?.uuid);
        }
    }, [open, drone]);

    useEffect(() => {
        if (!open) {
            setStreamActive(false);
        }
    }, [open]);

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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-black/95 border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] sm:max-w-[800px] p-0 overflow-hidden">
                <DialogHeader className="p-4 bg-[hsl(var(--bg-secondary))] border-b border-[hsl(var(--border-primary))]">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="flex items-center gap-2">
                                <Camera size={16} />
                                Live Feed: {drone?.name}
                            </DialogTitle>
                            <DialogDescription className="text-xs font-mono text-[hsl(var(--text-muted))]">
                                UUID: {drone?.uuid} • IP: {drone?.address}
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
    );
}
