import { useState, useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { TerminalEntry } from '../types';

export const CommanderConsole = ({
  droneName,
  droneId,
}: {
  droneName: string;
  droneId: string;
}) => {
  const [logs, setLogs] = useState<TerminalEntry[]>([
    { type: 'output', content: `[SYSTEM] MAVSDK Server initialized on port 50051` },
    { type: 'output', content: `[LINK] Waiting for heartbeat from ${droneId.split('-')[0]}...` },
    { type: 'output', content: `[LINK] Heartbeat detected (MAVLink v2)` },
    { type: 'output', content: `[PARAM] Requesting parameters... OK` },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

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
    }, 200);

    setInput('');
  };

  return (
    <div className="flex flex-col h-[600px] w-full bg-[#09090b] text-zinc-300 font-mono text-xs overflow-hidden border border-zinc-800 rounded-lg shadow-2xl">
      <div className="h-12 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between px-4 select-none shrink-0">
        <div className="flex items-center gap-3 mr-2">
          <div className="p-1.5 bg-amber-500/10 rounded border border-amber-500/20">
            <Terminal size={12} className="text-amber-500" />
          </div>
          <span className="mt-[0.2em] font-bold text-zinc-100 tracking-wide uppercase">
            {droneName}
          </span>
        </div>
      </div>

      {/* Full Width Terminal */}
      <div className="flex-1 flex flex-col bg-[#050505] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        ></div>

        {/* Scrollable Logs */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-[11px] z-10 scrollbar-thin scrollbar-thumb-zinc-800"
        >
          {logs.map((log, i) => (
            <div
              key={i}
              className={`flex gap-2 ${log.type === 'command' ? 'text-amber-500' : 'text-zinc-400'}`}
            >
              <span className="opacity-30 select-none w-[30px] text-right">
                {(i + 1).toString().padStart(3, '0')}
              </span>
              <span>{log.content}</span>
            </div>
          ))}
          <div className="h-4" />
        </div>
      </div>

      {/* Input */}
      <div className="h-10 bg-zinc-900 border-t border-zinc-800 flex items-center px-2 gap-2 shrink-0">
        <span className="text-amber-500 px-2 text-xs font-bold">MAV{'>'}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCommand(input)}
          className="flex-1 bg-transparent border-none outline-none text-xs text-zinc-300 placeholder-zinc-700 font-mono h-full"
          placeholder="Enter MAVLink command (e.g., 'commander takeoff')"
          autoFocus
        />
      </div>
    </div>
  );
};
