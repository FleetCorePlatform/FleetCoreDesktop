import { useState, useEffect, useRef } from 'react';
import { Terminal, Activity, Info, AlertCircle } from 'lucide-react';
import { TerminalEntry } from '../types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface DroneTerminalProps {
  droneName: string;
  droneId: string;
}

export function DroneTerminal({ droneName, droneId }: DroneTerminalProps) {
  const [logs, setLogs] = useState<TerminalEntry[]>([
    { type: 'output', content: `[SYSTEM] MAVSDK Server initialized on port 50051` },
    { type: 'output', content: `[LINK] Waiting for heartbeat from ${droneId.split('-')[0]}...` },
    { type: 'output', content: `[LINK] Heartbeat detected (MAVLink v2)` },
    { type: 'output', content: `[PARAM] Requesting parameters... OK` },
  ]);

  const [telemetry, setTelemetry] = useState<string[]>([
    `[INFO] Battery: 84% (4.1V/cell)`,
    `[INFO] GPS: 3D Fix, 12 Satellites`,
    `[INFO] Heading: 142.5 deg`,
    `[INFO] VFR_HUD: Alt: 14.2m, GS: 2.8m/s`,
  ]);

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const teleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    if (teleRef.current) teleRef.current.scrollTop = teleRef.current.scrollHeight;
  }, [telemetry]);

  const handleCommand = (cmd: string) => {
    if (!cmd.trim()) return;

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    setLogs((prev) => [
      ...prev,
      { type: 'command', content: `[${timestamp}] > ${cmd.toUpperCase()}` },
    ]);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        { type: 'output', content: `[ACK] Command accepted: ${cmd.split(' ')[0]}` },
      ]);

      // Add fake telemetry response
      setTelemetry((prev) => [...prev, `[TELE] CMD_ACK: ${cmd.split(' ')[0]} SUCCESS`]);
    }, 200);

    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-zinc-300 font-mono text-xs overflow-hidden border border-zinc-800 rounded-lg shadow-2xl">
      <Tabs defaultValue="console" className="flex-1 flex flex-col">
        <div className="h-10 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between px-4 select-none shrink-0">
          <TabsList className="bg-transparent border-none gap-4">
            <TabsTrigger
              value="console"
              className="data-[state=active]:bg-transparent data-[state=active]:text-amber-500 data-[state=active]:shadow-none p-0 h-auto font-bold uppercase tracking-wider gap-2 flex items-center"
            >
              <Terminal size={14} /> {droneName} - Console
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="data-[state=active]:bg-transparent data-[state=active]:text-emerald-500 data-[state=active]:shadow-none p-0 h-auto font-bold uppercase tracking-wider gap-2 flex items-center"
            >
              <Activity size={14} /> System Logs
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
            UPLINK ACTIVE
          </div>
        </div>

        <TabsContent
          value="console"
          className="flex-1 flex flex-col m-0 relative overflow-hidden bg-[#050505]"
        >
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(#333_1px,transparent_1px),linear-gradient(90deg,#333_1px,transparent_1px)] bg-[size:20px_20px]" />

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-[11px] z-10 scrollbar-thin scrollbar-thumb-zinc-800"
          >
            {logs.map((log, i) => (
              <div
                key={i}
                className={`flex gap-2 ${log.type === 'command' ? 'text-amber-500' : log.type === 'error' ? 'text-red-500' : 'text-zinc-400'}`}
              >
                <span className="opacity-30 select-none w-[30px] text-right">
                  {(i + 1).toString().padStart(3, '0')}
                </span>
                <span>{log.content}</span>
              </div>
            ))}
          </div>

          <div className="h-9 bg-zinc-900 border-t border-zinc-800 flex items-center px-2 gap-2 shrink-0 z-20">
            <span className="text-amber-500 px-2 text-xs font-bold">MAV{'>'}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCommand(input)}
              className="flex-1 bg-transparent border-none outline-none text-xs text-zinc-300 placeholder-zinc-700 font-mono h-full"
              placeholder="Enter command..."
              autoFocus
            />
          </div>
        </TabsContent>

        <TabsContent
          value="logs"
          className="flex-1 flex flex-col m-0 relative overflow-hidden bg-[#050505]"
        >
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(#333_1px,transparent_1px),linear-gradient(90deg,#333_1px,transparent_1px)] bg-[size:20px_20px]" />

          <div
            ref={teleRef}
            className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px] z-10 scrollbar-thin scrollbar-thumb-zinc-800"
          >
            {telemetry.map((log, i) => (
              <div
                key={i}
                className="flex gap-3 border-l-2 border-emerald-500/20 pl-3 py-1 bg-emerald-500/5"
              >
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-600 mb-0.5">
                    {new Date().toLocaleTimeString()}
                  </span>
                  <span className="text-emerald-400/80">{log}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="h-7 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between px-4 shrink-0">
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Info size={10} /> <span>12 Events</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500">
                <AlertCircle size={10} /> <span>0 Errors</span>
              </div>
            </div>
            <button className="text-[10px] uppercase font-bold text-zinc-600 hover:text-zinc-400">
              Clear Buffer
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
