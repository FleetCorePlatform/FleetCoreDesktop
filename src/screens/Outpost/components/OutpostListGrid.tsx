import { Search, MapPin } from 'lucide-react';
import { OutpostCard } from './OutpostCard';
import { Outpost } from '@/screens/common/types.ts';

interface OutpostListGridProps {
  loading: boolean;
  filteredOutposts: Outpost[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function OutpostListGrid({
  loading,
  filteredOutposts,
  searchQuery,
  setSearchQuery,
}: OutpostListGridProps) {
  return (
    <>
      {/* --- Filters --- */}
      <div className="flex items-center gap-4 bg-[hsl(var(--bg-secondary))] p-1 rounded-lg border border-[hsl(var(--border-primary))] w-full sm:w-fit">
        <div className="relative group w-full sm:w-80">
          <div className="absolute left-3 top-2.5 text-[hsl(var(--text-secondary))] group-focus-within:text-[hsl(var(--text-primary))] transition-colors">
            <Search size={16} />
          </div>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded bg-transparent text-sm text-[hsl(var(--text-primary))] focus:outline-none placeholder:text-[hsl(var(--text-muted))]"
            placeholder="Search outposts..."
          />
        </div>
      </div>

      {/* --- Grid Content --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-[hsl(var(--text-secondary))] col-span-full text-center py-10">
            Loading outposts...
          </p>
        ) : filteredOutposts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border border-dashed border-[hsl(var(--border-primary))] rounded-xl bg-[hsl(var(--bg-secondary))]/50">
            <div className="w-12 h-12 rounded-full bg-[#282e39] flex items-center justify-center mb-4 text-[hsl(var(--text-secondary))]">
              <MapPin size={24} />
            </div>
            <h3 className="text-lg font-medium text-[hsl(var(--text-primary))]">
              No outposts found
            </h3>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1 max-w-sm">
              Get started by defining a new operational zone using the map editor.
            </p>
          </div>
        ) : (
          filteredOutposts.map((outpost) => <OutpostCard key={outpost.uuid} outpost={outpost} />)
        )}
      </div>
    </>
  );
}
