import { ArrowLeft, FileText, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Drone } from '../types';
import { NavigateFunction } from 'react-router-dom';

interface DroneHeaderProps {
  drone: Drone;
  navigate: NavigateFunction;
}

export function DroneHeader({ drone, navigate }: DroneHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-9 w-9 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-secondary))]"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl tracking-tight">{drone.name}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-[hsl(var(--text-secondary))] mt-1 font-mono">
            <span>UUID: {drone.uuid.split('-')[0]}...</span>
            <span className="w-1 h-1 rounded-full bg-[hsl(var(--text-muted))]" />
            <span className="uppercase">MODEL: {drone.model}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(`/drones/${drone.uuid}/control`)}
          className="border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))]"
        >
          <FileText size={16} className="mr-2" /> Logs
        </Button>

        <Button
          onClick={() => navigate(`/drones/${drone.uuid}/control`)}
          className="bg-white text-black hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300"
        >
          <Terminal size={16} className="mr-2" />
          <span className="font-mono uppercase tracking-widest text-xs font-bold">
            Control Center
          </span>
        </Button>
      </div>
    </div>
  );
}
