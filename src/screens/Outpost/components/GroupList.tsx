import { Search, Box, History, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Link } from 'react-router-dom';
import { GroupSummary, OutpostSummary } from '@/screens/common/types.ts';

interface GroupListProps {
  filteredGroups: GroupSummary[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  outpost: OutpostSummary;
  outpostUuid: string | undefined;
}

export function GroupList({
  filteredGroups,
  searchQuery,
  setSearchQuery,
  outpost,
  outpostUuid,
}: GroupListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Assigned Groups</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <Input
            placeholder="Search groups..."
            className="pl-8 h-9 bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group) => (
          <Card
            key={group.groupUUID}
            className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] hover:border-[hsl(var(--border-secondary))] transition-all"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">{group.groupName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-[hsl(var(--text-muted))] mt-2">
                <Box size={16} className="mr-2" />
                {group.groupDroneCount} Drones Assigned
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                <Link to={`/missions/${group.groupUUID}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-7 border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-white hover:bg-[hsl(var(--bg-tertiary))]"
                  >
                    <History className="mr-1 h-3 w-3" /> Missions
                  </Button>
                </Link>

                <Link to={`/missions/new`} state={{ groupData: group, outpostData: outpost }}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-7 border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-white hover:bg-[hsl(var(--bg-tertiary))]"
                  >
                    <Plus className="mr-1 h-3 w-3" /> New Mission
                  </Button>
                </Link>

                <Link to={`/groups/${group.groupUUID}/${outpostUuid}`} className="col-span-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-7 border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-white hover:bg-[hsl(var(--bg-tertiary))]"
                  >
                    <ArrowRight className="mr-1 h-3 w-3" /> Manage Group
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredGroups.length === 0 && (
          <div className="col-span-full py-8 text-center text-[hsl(var(--text-secondary))] border border-dashed border-[hsl(var(--border-primary))] rounded-lg">
            No groups found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
