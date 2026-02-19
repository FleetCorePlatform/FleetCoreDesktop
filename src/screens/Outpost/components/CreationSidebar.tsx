import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Loader2, Crosshair, AlertCircle, PanelLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Coords } from '@/screens/Outpost/types.ts';

interface CreationSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  outpostName: string;
  setOutpostName: (name: string) => void;
  handleUseCurrentLocation: () => void;
  isLocating: boolean;
  coords: Coords;
  setCoords: (coords: Coords) => void;
  metrics: { area: number; perimeter: number };
  isClosed: boolean;
  postOutpostForm: () => void;
  isSubmitting: boolean;
}

export function CreationSidebar({
  sidebarOpen,
  setSidebarOpen,
  outpostName,
  setOutpostName,
  handleUseCurrentLocation,
  isLocating,
  coords,
  setCoords,
  metrics,
  isClosed,
  postOutpostForm,
  isSubmitting,
}: CreationSidebarProps) {
  return (
    <aside
      className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:relative
            w-full sm:w-[340px]
            flex flex-col bg-[hsl(var(--bg-secondary))] border-r border-[hsl(var(--border-primary))] 
            z-[1500] lg:z-20 shadow-2xl
            transition-transform duration-300 ease-in-out
            h-[calc(100vh-57px)]
        `}
    >
      <div className="px-5 py-4 border-b border-[hsl(var(--border-primary))]">
        <div className="flex items-center gap-2 mb-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="h-8 w-8 -ml-2 lg:hidden md:hidden text-[hsl(var(--text-secondary))]"
          >
            <PanelLeft size={18} />
          </Button>
          <h1 className="text-lg font-bold">New Outpost</h1>
        </div>
        <p className="text-xs text-[hsl(var(--text-secondary))] pl-7">
          Define operational zone parameters
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-[#3b4354] scrollbar-track-transparent">
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
            Identification
          </h3>
          <div className="space-y-2">
            <Label className="text-xs">Designator / Name</Label>
            <Input
              placeholder="e.g. OP-Alpha-01"
              className="h-9 text-sm"
              value={outpostName}
              onChange={(e) => setOutpostName(e.target.value)}
            />
          </div>
        </div>

        <div className="h-px bg-[#282e39]" />

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
              Coordinates
            </h3>
            <button
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="text-[#135bec] text-xs font-medium hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              {isLocating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Crosshair size={14} />
              )}
              {isLocating ? 'Locating...' : 'Use Current'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">
                Latitude
              </span>
              <Input
                value={coords.lat}
                onChange={(e) => setCoords({ ...coords, lat: parseFloat(e.target.value) || 0 })}
                className="font-mono h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">
                Longitude
              </span>
              <Input
                value={coords.lng}
                onChange={(e) => setCoords({ ...coords, lng: parseFloat(e.target.value) || 0 })}
                className="font-mono h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="h-px bg-[#282e39]" />
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
              Geofence Metrics
            </h3>
            {isClosed ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                Boundary Closed
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-medium border border-yellow-500/20 flex items-center gap-1">
                <AlertCircle size={10} />
                Incomplete
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-2.5">
              <div className="text-[hsl(var(--text-secondary))] text-[10px] mb-0.5">Total Area</div>
              <div className="text-base font-bold text-[hsl(var(--text-primary))]">
                {metrics.area > 0 ? metrics.area.toFixed(2) : '-'}{' '}
                <span className="text-xs font-normal text-[hsl(var(--text-secondary))]">km²</span>
              </div>
            </div>
            <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-2.5">
              <div className="text-[hsl(var(--text-secondary))] text-[10px] mb-0.5">Perimeter</div>
              <div className="text-base font-bold text-[hsl(var(--text-primary))]">
                {metrics.perimeter > 0 ? metrics.perimeter.toFixed(2) : '-'}{' '}
                <span className="text-xs font-normal text-[hsl(var(--text-secondary))]">km</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-secondary))] space-y-2">
        <Button
          className="w-full h-9 text-sm bg-white text-black hover:bg-gray-200"
          disabled={
            !isClosed || !outpostName || isSubmitting || coords.lat === 0 || coords.lng === 0
          }
          onClick={postOutpostForm}
        >
          {isSubmitting ? 'Deploying...' : 'Create Outpost'}
        </Button>
        <Link to={'/outposts'}>
          <Button
            variant="outline"
            className="w-full h-9 text-sm border-[hsl(var(--border-secondary))] hover:bg-[hsl(var(--bg-tertiary))]"
          >
            Cancel
          </Button>
        </Link>
      </div>
    </aside>
  );
}
