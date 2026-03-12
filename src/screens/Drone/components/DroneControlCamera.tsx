import { RefObject } from 'react';
import {
  Camera,
  Anchor,
  PlaneTakeoff,
  Gamepad2,
  ShieldAlert,
  OctagonAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { OnScreenJoystick } from './OnScreenJoystick';
import { DroneSummaryModel } from '@/screens/Group/types.ts';
import {ControlStatus, LiveTelemetryData} from '@/screens/Drone/types.ts';

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
  telemetry: LiveTelemetryData | null;
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
  telemetry,
  onStartStream,
  onToggleControl,
}: DroneControlCameraProps) {
  const formatUptime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ${seconds % 60}s`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  };

  return (
    <div className="relative w-full h-full bg-[hsl(var(--bg-secondary))] overflow-hidden flex flex-col">
      {/* HUD Header */}
      <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-[hsl(var(--bg-secondary))]/80 to-transparent z-20 flex items-start justify-between px-3 lg:px-6 pt-2 pb-4 pointer-events-none">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <Camera size={14} className="text-[hsl(var(--text-secondary))] shrink-0" />
            <span className="font-bold text-[hsl(var(--text-primary))] tracking-widest uppercase text-xs lg:text-sm">
              {drone.name}
            </span>
            {streamActive &&
              <Badge
                variant="outline"
                className="text-[10px] border-[hsl(var(--border-primary))] text-[hsl(var(--text-muted))] bg-[hsl(var(--bg-secondary))]/50 h-5 px-1.5"
              >
                LIVE FEED
              </Badge>
            }
          </div>
          {/* Stats */}
          {streamActive &&
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] lg:text-[10px] font-mono text-[hsl(var(--text-muted))] uppercase mt-0.5">
              <span>WebRTC</span>
              <span className="opacity-30">•</span>
              <span>
                Lat:{' '}
                <span
                  className={
                    stats.latency > 200
                      ? 'text-red-500'
                      : stats.latency > 100
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                  }
                >
                  {stats.latency.toFixed(0)}ms
                </span>
              </span>
              <span className="opacity-30">•</span>
              <span>
                BR: <span className="text-emerald-500">{stats.bitrate.toFixed(2)}Mb</span>
              </span>
              <span className="opacity-30">•</span>
              <span>
                Loss:{' '}
                <span className={stats.packetLoss > 0 ? 'text-red-500' : 'text-emerald-500'}>
                  {stats.packetLoss}
                </span>
              </span>
              <span className="opacity-30">•</span>
              <span>
                Jit: <span className="text-emerald-500">{stats.jitter.toFixed(1)}ms</span>
              </span>
              <span className="opacity-30">•</span>
              <span>
                FPS: <span className="text-emerald-500">{stats.fps.toFixed(0)}</span>
              </span>
            </div>
          }
        </div>

        <div className="flex items-center gap-2 pointer-events-auto shrink-0 ml-2">
          {streamActive && (
            <Button
              size="sm"
              variant={controlStatus === ControlStatus.ACTIVE ? 'default' : 'outline'}
              className={`h-7 lg:h-8 text-[10px] lg:text-xs font-bold uppercase transition-colors px-2 lg:px-3 ${
                controlStatus === ControlStatus.ACTIVE
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : controlStatus === ControlStatus.PENDING
                    ? 'bg-amber-500/20 text-amber-500 border-amber-500/50'
                    : 'bg-[hsl(var(--bg-secondary))]/50 border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
              }`}
              onClick={onToggleControl}
              disabled={controlStatus === ControlStatus.PENDING}
            >
              <Gamepad2 size={12} className="mr-1 lg:mr-2 shrink-0" />
              <span className="hidden sm:inline">
                {controlStatus === ControlStatus.ACTIVE
                  ? 'Release Control'
                  : controlStatus === ControlStatus.PENDING
                    ? 'Negotiating...'
                    : 'Request Control'}
              </span>
              <span className="sm:hidden">
                {controlStatus === ControlStatus.ACTIVE
                  ? 'Release'
                  : controlStatus === ControlStatus.PENDING
                    ? '...'
                    : 'Control'}
              </span>
            </Button>
          )}

          {streamActive && (
            <div className="flex items-center gap-1.5 pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)] shrink-0" />
              <span className="text-[10px] font-bold text-red-500 tracking-tighter uppercase hidden sm:inline">
                Live Signal
              </span>
            </div>
          )}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(var(--bg-secondary))]/20">
            <div className="w-24 h-24 border border-[hsl(var(--border-primary))]/30 rounded-full flex items-center justify-center animate-pulse">
              <Camera size={32} className="text-[hsl(var(--text-muted))]/40" />
            </div>
          </div>
        )}

        {streamError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(var(--bg-primary))]/90 text-center p-6 lg:p-8">
            <OctagonAlert className="h-10 w-10 lg:h-12 lg:w-12 text-red-500 mb-4" />
            <h3 className="text-base lg:text-lg font-bold text-[hsl(var(--text-primary))] mb-2 uppercase tracking-tighter">
              Connection error
            </h3>
            <p className="text-xs lg:text-sm text-[hsl(var(--text-muted))] font-mono mb-6">
              {streamError}
            </p>
            <Button
              onClick={onStartStream}
              variant="outline"
              className="border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-secondary))] pointer-events-auto"
            >
              Retry Handshake
            </Button>
          </div>
        )}

        <div className="z-1500 absolute inset-0 pointer-events-none border border-[hsl(var(--border-primary))]/20 m-4">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center opacity-40">
            <div className="absolute w-full h-px bg-emerald-500" />
            <div className="absolute h-full w-px bg-emerald-500" />
            <div className="w-2 h-2 border border-emerald-500 rounded-full" />
          </div>
        </div>

        {showOverlay && controlStatus === ControlStatus.ACTIVE && (
          <div className="absolute inset-0 z-30 flex items-end justify-between p-4 lg:p-12 pointer-events-none">
            <div className="pointer-events-auto">
              <OnScreenJoystick
                label="Throttle / Yaw"
                onMove={(x, y) => onControlMove('left', x, y)}
              />
            </div>
            <div className="flex items-end gap-4 lg:gap-6 pointer-events-none">
              <div className="flex flex-col items-center gap-3 lg:gap-4 pointer-events-auto">
                <Button
                  onClick={onTakeoff}
                  className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-emerald-600/80 hover:bg-emerald-600 text-white shadow-2xl border-2 border-emerald-500/50 flex flex-col items-center justify-center p-0 transition-transform active:scale-95 mb-2"
                >
                  <PlaneTakeoff size={20} />
                  <span className="text-[9px] font-black uppercase tracking-tighter mt-1">
                    Takeoff
                  </span>
                </Button>
                <Button
                  onClick={onLand}
                  className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-red-600/80 hover:bg-red-600 text-white shadow-2xl border-2 border-red-500/50 flex flex-col items-center justify-center p-0 transition-transform active:scale-95"
                >
                  <Anchor size={20} />
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

        {streamActive && controlStatus !== ControlStatus.ACTIVE && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full bg-[hsl(var(--bg-primary))]/60 border border-[hsl(var(--border-primary))]/40 backdrop-blur-md pointer-events-none whitespace-nowrap">
            <ShieldAlert size={14} className="text-[hsl(var(--text-secondary))] shrink-0" />
            <span className="text-[10px] lg:text-xs font-mono font-bold text-[hsl(var(--text-secondary))] uppercase tracking-widest">
              Observer Mode
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-6 bg-[hsl(var(--bg-secondary))]/90 border-t border-[hsl(var(--border-primary))] flex items-center justify-between px-3 lg:px-6 z-20 shrink-0">
        <div className="flex items-center gap-2 lg:gap-4 text-[9px] font-mono text-[hsl(var(--text-muted))] uppercase tracking-widest">
          <span>Up: {streamActive && telemetry ? formatUptime(telemetry.uptime_s) : 'N/A'}</span>
          <span className="hidden sm:inline">
            Home: {drone.home_position.x.toFixed(3)} • {drone.home_position.y.toFixed(3)}
          </span>
        </div>
        <div className="flex items-center gap-2 lg:gap-4 text-[9px] font-mono text-emerald-500 font-bold uppercase tracking-widest">
          <span>Bat: {streamActive && telemetry ? `${telemetry.battery.remaining_percent}%` : 'N/A'}</span>
          <span className="hidden sm:inline">GPS: {streamActive && telemetry ? telemetry.health.is_global_position_ok ? '3D-FIX' : 'No GPS Lock' : 'N/A'}</span>
          <span className="sm:hidden">{streamActive && telemetry ? telemetry.health.is_global_position_ok ? '3D-FIX' : 'No GPS Lock' : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}