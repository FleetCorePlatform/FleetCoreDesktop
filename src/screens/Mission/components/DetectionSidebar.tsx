import { MapPin, Clock, Filter, ScanLine, Layers, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Detection, FilterStatus } from '@/screens/Mission/types';

interface DetectionSidebarProps {
  activeFilter: FilterStatus;
  setActiveFilter: (filter: FilterStatus) => void;
  filteredDetections: Detection[];
  selectedDetection: Detection | null;
  handleOpenDetection: (detection: Detection) => void;
  formatTime: (iso: string) => string;
  formatCoords: (lat: number, lng: number) => string;
}

export function DetectionSidebar({
  activeFilter,
  setActiveFilter,
  filteredDetections,
  selectedDetection,
  handleOpenDetection,
  formatTime,
  formatCoords,
}: DetectionSidebarProps) {
  return (
    <div className="flex-1 md:max-w-xl border-r border-[hsl(var(--border-primary))] flex flex-col bg-[hsl(var(--bg-primary))]">
      {/* Toolbar */}
      <div className="h-10 border-b border-[hsl(var(--border-primary))] flex items-center px-4 justify-between bg-[hsl(var(--bg-tertiary))]/50">
        <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--text-secondary))] uppercase font-bold">
          <Layers size={12} />
          Stream Sequence
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 text-[10px] gap-1 hover:text-[hsl(var(--text-primary))] ${activeFilter !== 'ALL' ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-muted))]'}`}
            >
              <Filter size={10} />
              {activeFilter === 'ALL' ? 'Filter' : activeFilter.replace('_', ' ')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] font-mono text-[10px]"
          >
            <DropdownMenuItem onClick={() => setActiveFilter('ALL')}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveFilter('PENDING')} className="text-amber-500">
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveFilter('CONFIRMED')} className="text-red-500">
              Confirmed
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setActiveFilter('FALSE_POSITIVE')}
              className="text-emerald-500"
            >
              False positive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0">
        {filteredDetections && filteredDetections.length > 0 ? (
          filteredDetections.map((det) => {
            const isPending = det.false_positive === null;
            const isSelected = selectedDetection?.uuid === det.uuid;

            return (
              <div key={det.uuid} className="relative pl-6 pb-8 last:pb-0 group">
                {/* Timeline Line */}
                <div className="absolute left-[11px] top-3 bottom-0 w-px bg-[hsl(var(--border-primary))] group-last:hidden" />

                {/* Timeline Node */}
                <div
                  className={`absolute left-0 top-1.5 h-[23px] w-[23px] rounded-full border-4 border-[hsl(var(--bg-primary))] flex items-center justify-center z-10 transition-colors
                                            ${isPending ? 'bg-amber-500/40 text-black animate-pulse' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-muted))] border-[hsl(var(--border-primary))]'}
                                        `}
                >
                  {isPending ? (
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  ) : (
                    <div className="w-1.5 h-1.5 bg-[hsl(var(--text-muted))] rounded-full" />
                  )}
                </div>

                {/* Card */}
                <div
                  onClick={() => handleOpenDetection(det)}
                  className={`cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:translate-x-1
                                                ${
                                                  isSelected
                                                    ? 'bg-[hsl(var(--accent))]/10 border-[hsl(var(--accent))] shadow-[0_0_15px_rgba(0,0,0,0.2)]'
                                                    : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] hover:border-[hsl(var(--text-muted))]'
                                                }
                                                `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 h-5 border-[hsl(var(--border-primary))] ${
                          det.confidence > 0.9
                            ? 'text-red-400 bg-red-400/10'
                            : 'text-amber-400 bg-amber-400/10'
                        }`}
                      >
                        {(det.confidence * 100).toFixed(0)}%
                      </Badge>
                      <span className="text-xs font-bold text-[hsl(var(--text-primary))] uppercase tracking-wider">
                        {det.object}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[hsl(var(--text-muted))] flex items-center gap-1">
                      <Clock size={10} /> {formatTime(det.detected_at)}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    {/* Thumbnail Placeholder */}
                    <div className="h-16 w-24 bg-black rounded border border-[hsl(var(--border-primary))] relative overflow-hidden flex-shrink-0 group-hover:border-[hsl(var(--text-muted))] transition-colors">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-zinc-950 opacity-50" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ScanLine size={16} className="text-[hsl(var(--text-muted))] opacity-50" />
                      </div>
                      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-red-500/50 box-border" />
                    </div>

                    {/* Meta Data */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--text-secondary))]">
                          <MapPin size={10} />
                          <span className="font-mono">
                            {formatCoords(det.location.x, det.location.y)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--text-secondary))]">
                          <Terminal size={10} />
                          <span className="font-mono truncate w-32">{det.uuid}</span>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-bold tracking-wider ${
                            det.false_positive === null
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : !det.false_positive
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {det.false_positive === null
                            ? 'PENDING'
                            : det.false_positive
                              ? 'FALSE POSITIVE'
                              : 'CONFIRMED'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
            <ScanLine size={48} className="mb-4" />
            <p className="text-xs uppercase tracking-widest font-bold">No detections found</p>
          </div>
        )}
      </div>
    </div>
  );
}
