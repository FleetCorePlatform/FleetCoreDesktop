import {useCallback, useEffect, useRef} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useGamepad} from '@/hooks/useGamepad';
import {DroneControlCamera} from './components/DroneControlCamera';
import {DroneTerminal} from './components/DroneTerminal';
import {
  ControlActions,
  ManualControlActionState,
  ManualControlState,
  sendManualControl
} from '@/utils/droneManualControl';
import {AlertCircle, ChevronLeft, Gamepad2, Info, LayoutDashboard} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {DroneSummaryModel} from "@/screens/Group/types.ts";

export default function DroneControlScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const drone: DroneSummaryModel = location.state?.drone;

  const manualControlRef = useRef<ManualControlState>({
    pitch: 0,
    roll: 0,
    throttle: 0.5,
    yaw: 0,
  });

  const onGamepadDirectUpdate = useCallback(
    (gp: Gamepad) => {
      if (!drone.uuid) return;

      const deadzone = 0.1;

      const scaleAxis = (v: number) => (Math.abs(v) > deadzone ? v : 0);

      const newState: ManualControlState = {
        roll: scaleAxis(gp.axes[2]),
        pitch: scaleAxis(-gp.axes[3]),
        throttle: Math.max(0.0, Math.min(1.0, (-scaleAxis(gp.axes[1]) + 1) / 2)),
        yaw: scaleAxis(gp.axes[0]),
      };

      manualControlRef.current = newState;
      sendManualControl(newState);
    }, [drone.uuid]
  );

  const gamepad = useGamepad(onGamepadDirectUpdate);

  const handleTakeoff = () => {
    console.log('Initiating autonomous takeoff...');

    const payload: ManualControlActionState = {
      action: ControlActions.TAKEOFF
    }

    sendManualControl(payload)
  };

  const handleLand = () => {
    console.log('Initiating landing sequence...');

    const payload: ManualControlActionState = {
      action: ControlActions.LAND
    }

    sendManualControl(payload)
  };

  const handleControlMove = (side: 'left' | 'right', x: number, y: number) => {
    if (!drone.uuid) return;

    if (side === 'left') {
      manualControlRef.current.yaw = x;
      manualControlRef.current.throttle = Math.max(0.0, Math.min(1.0, (-y + 1) / 2));
    } else {
      manualControlRef.current.roll = x;
      manualControlRef.current.pitch = -y;
    }

    sendManualControl(manualControlRef.current);
    if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
    }
  };

  const lastButtonsRef = useRef<boolean[]>(new Array(16).fill(false));

  useEffect(() => {
    if (!gamepad.connected) return;

    if (gamepad.buttons[0] && !lastButtonsRef.current[0]) handleTakeoff();
    if (gamepad.buttons[1] && !lastButtonsRef.current[1]) handleLand();

    lastButtonsRef.current = [...gamepad.buttons];
  }, [gamepad]);

  if (!drone) {
    return (
      <div className="h-full w-full bg-zinc-950 flex flex-col items-center justify-center gap-6 text-red-500">
        <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
          <AlertCircle size={48} />
        </div>
        <p className="font-mono text-sm tracking-widest uppercase">{'Target not found'}</p>
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
    <div className="flex-1 w-full bg-[#050505] text-zinc-300 font-mono overflow-hidden flex flex-col lg:flex-row p-2 lg:p-4 gap-2 lg:gap-4">
      {/* Sidebar Controls (Desktop) / Top Bar (Mobile) */}
      <div className="flex flex-row lg:flex-col items-center justify-between lg:w-16 h-12 lg:h-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-2 z-50 shrink-0">
        <div className="flex flex-row lg:flex-col gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-zinc-500 hover:text-white hover:bg-white/5 h-10 w-10"
            title="Back"
          >
            <ChevronLeft size={20} />
          </Button>
          <div className="w-full lg:h-px bg-zinc-800 lg:my-2 hidden lg:block" />
          <Button
            variant="ghost"
            size="icon"
            className="text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 h-10 w-10 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Gamepad2 size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-500 hover:text-white hover:bg-white/5 h-10 w-10"
          >
            <Info size={20} />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="text-zinc-500 hover:text-white hover:bg-white/5 h-10 w-10"
        >
          <LayoutDashboard size={20} />
        </Button>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col gap-2 lg:gap-4 min-h-0 overflow-hidden">
        {/* Top Section: Camera Feed */}
        <div className="flex-[3] min-h-0 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl relative">
          <DroneControlCamera
            drone={drone}
            showOverlay={!gamepad.connected}
            onControlMove={handleControlMove}
            onTakeoff={handleTakeoff}
            onLand={handleLand}
          />
        </div>

        {/* Bottom Section: Console & Status */}
        <div className="flex-[2] min-h-0 flex flex-col lg:flex-row gap-2 lg:gap-4 overflow-hidden">
          <div className="flex-1 min-h-0 min-w-0">
            <DroneTerminal droneName={drone.name} droneId={drone.uuid} />
          </div>

          {/* Quick Stats Panel (Desktop Only or Small Mobile) */}
          <div className="w-full lg:w-72 h-48 lg:h-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4 shrink-0 overflow-y-auto min-h-0">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2 flex items-center justify-between">
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
                  <span className="text-[10px] text-zinc-500 uppercase">{sys.label}</span>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold ${sys.color}`}>{sys.status}</span>
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${sys.color.replace('text-', 'bg-')} animate-pulse`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between text-[10px] text-zinc-600 mb-2">
                <span>Controller Input</span>
                <span>{gamepad.connected ? 'Gamepad' : 'Touch/Mouse'}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: gamepad.connected ? '100%' : '50%' }}
                />
              </div>
            </div>
          </div>
        </div>
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
