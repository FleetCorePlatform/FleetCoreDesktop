import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGamepad } from '@/hooks/useGamepad';
import { useDroneStream } from '@/hooks/useDroneStream';
import { DroneControlCamera } from './components/DroneControlCamera';
import { DroneTerminal } from './components/DroneTerminal';
import { DroneInfoPanel } from './components/DroneInfoPanel';
import { AlertCircle, ChevronLeft, Gamepad2, Info, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DroneSummaryModel } from '@/screens/Group/types.ts';
import {
  ControlActions,
  ManualControlActionState,
  ManualControlState,
  ControlStatus,
  ControlScreenSelectedView,
} from '@/screens/Drone/types.ts';
import {
  sendManualControl,
  releaseManualControl,
  requestManualControl,
  setControlStatusListener,
} from '@/utils/droneManualControl.ts';

export default function DroneControlScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const drone: DroneSummaryModel = location.state?.drone;

  const { videoRef, viewerHandleRef, prevStatsRef, streamActive, streamError, retry } =
    useDroneStream(drone);

  const [view, setView] = useState<ControlScreenSelectedView>('control');
  const manualControlRef = useRef<ManualControlState>({ pitch: 0, roll: 0, throttle: 0.5, yaw: 0 });
  const [controlStatus, setControlStatus] = useState<ControlStatus>(ControlStatus.IDLE);
  const [stats, setStats] = useState({ latency: 0, bitrate: 0, packetLoss: 0, jitter: 0, fps: 0 });

  useEffect(() => {
    setControlStatusListener((status) => setControlStatus(status));
    return () => {
      setControlStatusListener(() => {});
    };
  }, []);

  useEffect(() => {
    if (!streamActive || !viewerHandleRef.current) {
      setStats({ latency: 0, bitrate: 0, packetLoss: 0, jitter: 0, fps: 0 });
      return;
    }

    const interval = setInterval(async () => {
      const pc = viewerHandleRef.current?.peerConnection;
      if (!pc) return;
      try {
        const statsReport = await pc.getStats();
        let latency = 0,
          bitrate = 0,
          packetLoss = 0,
          jitter = 0,
          fps = 0;

        statsReport.forEach((report) => {
          if (report.type === 'inbound-rtp' && report.kind === 'video') {
            const { timestamp: now, bytesReceived: bytes, framesDecoded: frames = 0 } = report;
            if (prevStatsRef.current.timestamp > 0) {
              const dt = (now - prevStatsRef.current.timestamp) / 1000;
              if (dt > 0) {
                bitrate = ((bytes - prevStatsRef.current.bytesReceived) * 8) / dt / 1_000_000;
                fps = (frames - prevStatsRef.current.framesDecoded) / dt;
              }
            }
            prevStatsRef.current = { bytesReceived: bytes, framesDecoded: frames, timestamp: now };
            packetLoss = report.packetsLost || 0;
            jitter = (report.jitter || 0) * 1000;
          }
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            latency = (report.currentRoundTripTime || 0) * 1000;
          }
        });

        setStats({ latency, bitrate, packetLoss, jitter, fps });
      } catch (e) {
        console.error('Error fetching WebRTC stats:', e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [streamActive]);

  const handleToggleControl = () => {
    if (controlStatus === ControlStatus.ACTIVE) releaseManualControl();
    else if (controlStatus === ControlStatus.IDLE) requestManualControl();
  };

  const handleTakeoff = () =>
    sendManualControl({ action: ControlActions.TAKEOFF } as ManualControlActionState);
  const handleLand = () =>
    sendManualControl({ action: ControlActions.LAND } as ManualControlActionState);

  const handleControlMove = (side: 'left' | 'right', x: number, y: number) => {
    if (!drone?.uuid) return;
    if (side === 'left') {
      manualControlRef.current.yaw = x;
      manualControlRef.current.throttle = Math.max(0, Math.min(1, (-y + 1) / 2));
    } else {
      manualControlRef.current.roll = x;
      manualControlRef.current.pitch = -y;
    }
    sendManualControl(manualControlRef.current);
  };

  const onGamepadDirectUpdate = useCallback(
    (gp: Gamepad) => {
      if (!drone?.uuid) return;
      const dz = (v: number) => (Math.abs(v) > 0.1 ? v : 0);
      const state: ManualControlState = {
        roll: dz(gp.axes[2]),
        pitch: dz(-gp.axes[3]),
        throttle: Math.max(0, Math.min(1, (-dz(gp.axes[1]) + 1) / 2)),
        yaw: dz(gp.axes[0]),
      };
      manualControlRef.current = state;
      sendManualControl(state);
    },
    [drone?.uuid]
  );

  const gamepad = useGamepad(onGamepadDirectUpdate);
  const lastButtonsRef = useRef<boolean[]>(new Array(16).fill(false));

  useEffect(() => {
    if (!gamepad.connected) return;
    if (gamepad.buttons[0] && !lastButtonsRef.current[0]) handleTakeoff();
    if (gamepad.buttons[1] && !lastButtonsRef.current[1]) handleLand();
    lastButtonsRef.current = [...gamepad.buttons];
  }, [gamepad]);

  if (!drone) {
    return (
      <div className="h-full w-full bg-[hsl(var(--bg-primary))] flex flex-col items-center justify-center gap-6 text-red-500">
        <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
          <AlertCircle size={48} />
        </div>
        <p className="font-mono text-sm text-[hsl(var(--text-primary))] tracking-widest uppercase">
          Target not found
        </p>
        <Button
          variant="outline"
          className="border-red-500/50 text-red-500 hover:bg-red-500/10 uppercase tracking-widest text-xs font-bold"
          onClick={() => navigate(-1)}
        >
          Return to Fleet
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-mono overflow-hidden flex flex-col lg:flex-row p-2 lg:p-4 gap-2 lg:gap-4">
      {/* Sidebar (desktop) / Top bar (mobile) */}
      <div className="flex flex-row lg:flex-col items-center justify-between lg:w-16 h-12 lg:h-full bg-[hsl(var(--bg-secondary))]/50 border border-[hsl(var(--border-primary))] rounded-xl p-2 z-50 shrink-0">
        <div className="flex flex-row lg:flex-col gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] h-10 w-10"
          >
            <ChevronLeft size={20} />
          </Button>
          <div className="w-full lg:h-px bg-[hsl(var(--border-primary))] lg:my-2 hidden lg:block" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView('control')}
            className={`h-10 w-10 transition-colors ${
              view === 'control'
                ? 'text-emerald-500 hover:text-emerald-400 bg-emerald-500/10'
                : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            <Gamepad2 size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView('info')}
            className={`h-10 w-10 transition-colors ${
              view === 'info'
                ? 'text-emerald-500 hover:text-emerald-400 bg-emerald-500/10'
                : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            <Info size={20} />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] h-10 w-10"
        >
          <LayoutDashboard size={20} />
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
        {view === 'info' ? (
          <DroneInfoPanel droneUuid={drone.uuid} />
        ) : (
          <div className="flex flex-col gap-2 lg:gap-4 lg:h-full">
            <div className="h-[280px] sm:h-[360px] lg:h-auto lg:flex-[3] lg:min-h-0 bg-[hsl(var(--bg-secondary))] rounded-xl border border-[hsl(var(--border-primary))] overflow-hidden shadow-2xl relative shrink-0">
              <DroneControlCamera
                drone={drone}
                showOverlay={!gamepad.connected}
                onControlMove={handleControlMove}
                onTakeoff={handleTakeoff}
                onLand={handleLand}
                videoRef={videoRef}
                streamActive={streamActive}
                streamError={streamError}
                controlStatus={controlStatus}
                stats={stats}
                onStartStream={retry}
                onToggleControl={handleToggleControl}
              />
            </div>

            <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 lg:flex-[2] lg:min-h-0 lg:overflow-hidden">
              <div className="h-[280px] lg:h-auto flex-1 lg:min-h-0 lg:min-w-0">
                <DroneTerminal droneName={drone.name} connectionActive={streamActive} />
              </div>

              <div className="w-full lg:w-72 bg-[hsl(var(--bg-secondary))]/50 border border-[hsl(var(--border-primary))] rounded-xl p-4 flex flex-col gap-4 lg:shrink-0 lg:overflow-y-auto lg:min-h-0">
                <h3 className="text-[10px] font-bold text-[hsl(var(--text-muted))] uppercase tracking-widest border-b border-[hsl(var(--border-primary))] pb-2 flex items-center justify-between">
                  <span>Subsystems</span>
                  <span className="text-emerald-500 text-[8px]">All Nominal</span>
                </h3>

                <div className="space-y-4">
                  {[
                    { label: 'Position Hold', status: 'Active', color: 'text-emerald-500' },
                    { label: 'Avoidance', status: 'Standby', color: 'text-amber-500' },
                    { label: 'Telemetry', status: 'Encryption OK', color: 'text-emerald-500' },
                    { label: 'Signal Strength', status: '-42 dBm', color: 'text-emerald-500' },
                  ].map((sys, i) => (
                    <div
                      key={sys.label}
                      className="flex flex-col gap-1 animate-[fadeIn_0.5s_ease-out_forwards]"
                      style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}
                    >
                      <span className="text-[10px] text-[hsl(var(--text-muted))] uppercase">
                        {sys.label}
                      </span>
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold ${sys.color}`}>{sys.status}</span>
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${sys.color.replace('text-', 'bg-')} animate-pulse`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 lg:mt-auto pt-4 border-t border-[hsl(var(--border-primary))]">
                  <div className="flex items-center justify-between text-[10px] text-[hsl(var(--text-muted))] mb-2">
                    <span>Controller Input</span>
                    <span>{gamepad.connected ? 'Gamepad' : 'Touch/Mouse'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: gamepad.connected ? '100%' : '50%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
