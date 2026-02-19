import { useEffect, useRef, useState } from 'react';
import { DroneSummaryModel } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Camera, Signal, AlertTriangle } from 'lucide-react';
import { useUser } from '@/context/UserContext.ts';
import { startViewer, stopViewer, ViewerHandle } from '@/utils/kvsClient.ts';
import { apiCallFull } from '@/utils/api.ts';

interface CameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drone: DroneSummaryModel | null;
}

interface DroneStreamingRequest {
  enabled: boolean;
}

export function CameraDialog({ open, onOpenChange, drone }: CameraDialogProps) {
  const [streamActive, setStreamActive] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewerHandleRef = useRef<ViewerHandle | null>(null);
  const { credentials } = useUser();

  const setRemoteStreamState = async (shouldEnable: boolean) => {
    if (!drone?.uuid || !drone?.signaling_channel_name) return;

    const payload: DroneStreamingRequest = {
      enabled: shouldEnable,
    };

    try {
      const res = await apiCallFull<undefined>(
        `/api/v1/drones/${drone.uuid}/stream`,
        undefined,
        'POST',
        payload
      );
      if (res.status !== 204) {
        console.error('Error toggling stream, status:', res.status);
      }
    } catch (e) {
      console.error('Error toggling stream:', e);
    }
  };

  useEffect(() => {
    if (!open) {
      setRemoteStreamState(false);

      stopViewer(viewerHandleRef.current);
      viewerHandleRef.current = null;
      setStreamActive(false);
      setStreamError(null);
    }
  }, [open]);

  const handleStart = async () => {
    if (!credentials) return;
    setStreamError(null);

    try {
      await setRemoteStreamState(true);

      stopViewer(viewerHandleRef.current);
      viewerHandleRef.current = await startViewer(
        videoRef.current!,
        credentials!,
        'eu-central-1',
        drone!.signaling_channel_name
      );
      setStreamActive(true);
    } catch (err: any) {
      console.error('KVS Startup Failed', err);
      setStreamActive(false);

      if (err.message && err.message.includes('RTCPeerConnection is not supported')) {
        setStreamError('WebRTC Disabled (Linux/NVIDIA)');
      } else {
        setStreamError('Connection Failed');
      }
    }
  };

  const handleStreamToggle = () => {
    if (streamActive) {
      setRemoteStreamState(false);
      stopViewer(viewerHandleRef.current);
      viewerHandleRef.current = null;
      setStreamActive(false);
    } else {
      handleStart();
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
              <Badge
                variant="outline"
                className="text-red-500 border-red-500/50 bg-red-500/10 animate-pulse"
              >
                LIVE SIGNAL
              </Badge>
            ) : streamError ? (
              <Badge
                variant="outline"
                className="text-orange-500 border-orange-500/50 bg-orange-500/10"
              >
                DEV MODE
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-yellow-500 border-yellow-500/50 bg-yellow-500/10"
              >
                OFFLINE
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="aspect-video w-full relative bg-[#1a1a1a] group overflow-hidden">
          <video
            ref={videoRef}
            className={`w-full h-full object-contain ${streamActive && !streamError ? 'block' : 'hidden'}`}
            autoPlay
            playsInline
            muted
          />

          {streamError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 text-center p-8">
              <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Video Unavailable</h3>
              <p className="text-sm text-zinc-400 font-mono mb-4">{streamError}</p>
              <p className="text-xs text-zinc-500 max-w-sm">
                Local WebRTC is disabled due to WebKitGTK/GPU driver conflict.{' '}
                <a
                  href="https://github.com/FleetCorePlatform/FleetCoreDesktop/issues/1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-zinc-300"
                >
                  See issue #1
                </a>
              </p>
            </div>
          )}

          {/* Offline state  */}
          {!streamActive && !streamError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
              <div className="z-10 text-center space-y-4">
                <h2 className="text-3xl font-black tracking-widest text-[hsl(var(--text-muted))] opacity-30 select-none">
                  NO SIGNAL
                </h2>
                <Button
                  onClick={handleStreamToggle}
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
              STATUS:{' '}
              <span
                className={
                  streamActive
                    ? 'text-emerald-500'
                    : streamError
                      ? 'text-orange-500'
                      : 'text-yellow-500'
                }
              >
                {streamActive ? 'CONNECTED' : streamError ? 'BYPASSED' : 'STANDBY'}
              </span>
            </span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
