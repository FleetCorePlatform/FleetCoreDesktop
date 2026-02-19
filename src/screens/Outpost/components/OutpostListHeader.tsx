import { Button } from '@/components/ui/button.tsx';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function OutpostListHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Outpost Overview</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Manage operational zones and geofences
          </p>
        </div>
      </div>
      <Link to="/outposts/new" className="w-full sm:w-auto">
        <Button className="w-full bg-white text-black hover:bg-gray-200 h-10 shadow-lg shadow-white/5 flex justify-center">
          <Plus size={16} className="mr-2" />
          Create Outpost
        </Button>
      </Link>
    </div>
  );
}
