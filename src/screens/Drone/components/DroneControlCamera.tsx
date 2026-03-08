import { RefObject } from 'react';
import { Camera, AlertTriangle, Anchor, PlaneTakeoff, Gamepad2, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { OnScreenJoystick } from './OnScreenJoystick';
import { DroneSummaryModel } from '@/screens/Group/types.ts';
import { ControlStatus } from '@/screens/Drone/types.ts';

interface DroneControlCameraProps {
  drone: DroneSummaryModel;
  showOverlay: boolean;
  onControlMove: (side: 'left' | 'right', x: number, y: number) => void;
  onTakeoff: () => void;
  onLand: () => void;
  videoRef: RefObject<HTMLVideoElement | null>;
  streamActive: boolean;
  streamError: string | null;
  controlStatus: ControlStatus;
  stats: {
    latency: number;
    bitrate: number;
    packetLoss: number;
    jitter: number;
    fps: number;
  };
  onStartStream: () => void;
  onToggleControl: () => void;
}

export function DroneControlCamera({
  drone,
  showOverlay,
  onControlMove,
  onTakeoff,
  onLand,
  videoRef,
  streamActive,
  streamError,
  controlStatus,
  stats,
  onStartStream,
  onToggleControl,
}: DroneControlCameraProps) {
  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden flex flex-col">
      {/* HUD Header */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-20 flex items-center justify-between px-6 pointer-events-none">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-white" />
            <span className="font-bold text-white tracking-widest uppercase text-sm">
              {drone.name}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] border-white/20 text-white/50 bg-white/5 h-5 px-1.5"
            >
              LIVE FEED
            </Badge>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 mt-1 uppercase flex items-center gap-3">
            <span>Protocol: WebRTC</span>
            <span>•</span>
            <span>
              Latency:{' '}
              <span
                className={`${stats.latency > 200 ? 'text-red-500' : stats.latency > 100 ? 'text-amber-500' : 'text-emerald-500'}`}
              >
                {stats.latency.toFixed(0)}ms
              </span>
            </span>
            <span>•</span>
            <span>
              Bitrate: <span className="text-emerald-500">{stats.bitrate.toFixed(2)}Mbps</span>
            </span>
            <span>•</span>
            <span>
              Loss:{' '}
              <span className={`${stats.packetLoss > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {stats.packetLoss}
              </span>
            </span>
            <span>•</span>
            <span>
              Jitter: <span className="text-emerald-500">{stats.jitter.toFixed(1)}ms</span>
            </span>
            <span>•</span>
            <span>
              FPS: <span className="text-emerald-500">{stats.fps.toFixed(0)}</span>
            </span>
          </span>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          {streamActive && (
            <Button
              size="sm"
              variant={controlStatus === ControlStatus.ACTIVE ? 'default' : 'outline'}
              className={`h-8 text-xs font-bold uppercase transition-colors ${
                controlStatus === ControlStatus.ACTIVE
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : controlStatus === ControlStatus.PENDING
                    ? 'bg-amber-500/20 text-amber-500 border-amber-500/50'
                    : 'bg-zinc-900/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
              }`}
              onClick={onToggleControl}
              disabled={controlStatus === ControlStatus.PENDING}
            >
              <Gamepad2 size={14} className="mr-2" />
              {controlStatus === ControlStatus.ACTIVE
                ? 'Release Control'
                : controlStatus === ControlStatus.PENDING
                  ? 'Negotiating...'
                  : 'Request Control'}
            </Button>
          )}

          {streamActive ? (
            <div className="flex items-center gap-2 ml-2 pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              <span className="text-xs font-bold text-red-500 tracking-tighter uppercase">
                Live Signal
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Video, Content */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${streamActive ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          playsInline
          muted
        />

        {!streamActive && !streamError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/20">
            <div className="w-24 h-24 border border-white/10 rounded-full flex items-center justify-center animate-pulse">
              <Camera size={32} className="text-white/20" />
            </div>
          </div>
        )}

        {streamError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 text-center p-8">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tighter">
              Signal Interference
            </h3>
            <p className="text-sm text-zinc-400 font-mono mb-6">{streamError}</p>
            <Button
              onClick={onStartStream}
              variant="outline"
              className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10 pointer-events-auto"
            >
              Retry Handshake
            </Button>
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 m-4">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center opacity-40">
            <div className="absolute w-full h-px bg-emerald-500" />
            <div className="absolute h-full w-px bg-emerald-500" />
            <div className="w-2 h-2 border border-emerald-500 rounded-full" />
          </div>
        </div>

        {/* On-Screen Joysticks Overlay */}
        {showOverlay && controlStatus === ControlStatus.ACTIVE && (
          <div className="absolute inset-0 z-30 flex items-end justify-between p-6 lg:p-12 pointer-events-none">
            <div className="pointer-events-auto">
              <OnScreenJoystick
                label="Throttle / Yaw"
                onMove={(x, y) => onControlMove('left', x, y)}
              />
            </div>

            <div className="flex items-end gap-6 pointer-events-none">
              <div className="flex flex-col items-center gap-4 pointer-events-auto">
                <Button
                  onClick={onTakeoff}
                  className="w-16 h-16 rounded-full bg-emerald-600/80 hover:bg-emerald-600 text-white shadow-2xl border-2 border-emerald-500/50 flex flex-col items-center justify-center p-0 transition-transform active:scale-95 mb-2"
                >
                  <PlaneTakeoff size={24} />
                  <span className="text-[9px] font-black uppercase tracking-tighter mt-1">
                    Takeoff
                  </span>
                </Button>

                <Button
                  onClick={onLand}
                  className="w-16 h-16 rounded-full bg-red-600/80 hover:bg-red-600 text-white shadow-2xl border-2 border-red-500/50 flex flex-col items-center justify-center p-0 transition-transform active:scale-95"
                >
                  <Anchor size={24} />
                  <span className="text-[9px] font-black uppercase tracking-tighter mt-1">
                    Land
                  </span>
                </Button>
              </div>

              <div className="pointer-events-auto">
                <OnScreenJoystick
                  label="Pitch / Roll"
                  onMove={(x, y) => onControlMove('right', x, y)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Observer Mode Overlay */}
        {streamActive && controlStatus !== ControlStatus.ACTIVE && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 border border-white/10 backdrop-blur-md pointer-events-none">
            <ShieldAlert size={16} className="text-zinc-400" />
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
              Observer Mode Active
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-6 bg-black/90 border-t border-zinc-800 flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
          <span>Uptime: 01:24:02</span>
          <span>Home: 47.12 • 8.34</span>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono text-emerald-500 font-bold uppercase tracking-widest">
          <span>Battery: 84%</span>
          <span>GPS: 3D-FIX (12 SAT)</span>
        </div>
      </div>
    </div>
  );
}
