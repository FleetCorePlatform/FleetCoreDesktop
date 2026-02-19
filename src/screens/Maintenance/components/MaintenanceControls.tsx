import { Search, Filter, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MaintenanceControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  typeFilter: string | null;
  setTypeFilter: (filter: string | null) => void;
  availableTypes: string[];
}

export function MaintenanceControls({
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  availableTypes,
}: MaintenanceControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-[hsl(var(--text-muted))]" />
        <Input
          placeholder="Search drone name or description..."
          className="pl-8 h-9 bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        {typeFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTypeFilter(null)}
            className="h-9 text-red-400 hover:text-red-300 hover:bg-red-400/10 mr-2"
          >
            <XCircle size={14} className="mr-2" /> Clear Filter
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))]"
            >
              <Filter size={14} className="mr-2" />
              {typeFilter ? typeFilter.replace('_', ' ') : 'Filter Type'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]"
          >
            <DropdownMenuItem onClick={() => setTypeFilter(null)}>All Types</DropdownMenuItem>
            {availableTypes.map((type) => (
              <DropdownMenuItem key={type} onClick={() => setTypeFilter(type)}>
                {type.replace('_', ' ')}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
