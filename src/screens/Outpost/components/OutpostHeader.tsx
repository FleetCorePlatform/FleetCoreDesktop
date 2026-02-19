import { ArrowLeft, Plus, MapPin, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Link } from 'react-router-dom';
import { OutpostSummary } from '@/screens/common/types.ts';

interface OutpostHeaderProps {
  outpost: OutpostSummary;
  outpostUuid: string | undefined;
  openDialog: () => void;
}

export function OutpostHeader({ outpost, outpostUuid, openDialog }: OutpostHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Link to="/outposts">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 -ml-2 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-secondary))]"
          >
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{outpost.name}</h1>
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))] mt-1 font-mono">
            <MapPin size={14} />
            {outpost.latitude.toFixed(4)}, {outpost.longitude.toFixed(4)}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Link to={`/maintenance/${outpostUuid}`}>
          <Button
            variant="outline"
            className="bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] h-10 border-[hsl(var(--border-primary))]"
          >
            <Wrench size={16} className="mr-2" />
            Maintenances
          </Button>
        </Link>

        <Button
          onClick={openDialog}
          className="bg-white text-black hover:bg-gray-200 h-10 shadow-lg shadow-white/5"
        >
          <Plus size={16} className="mr-2" />
          New Group
        </Button>
      </div>
    </div>
  );
}
