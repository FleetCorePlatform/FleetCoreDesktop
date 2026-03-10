import { Users, Drone, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { GroupSummary, OutpostSummary } from '@/screens/common/types.ts';

interface OutpostStatsProps {
  outpost: OutpostSummary;
  groups: GroupSummary[];
}

export function OutpostStats({ outpost, groups }: OutpostStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">
              Total Groups
            </p>
            <h3 className="text-2xl font-bold mt-1">{groups.length}</h3>
          </div>
          <div className="p-2 bg-[hsl(var(--bg-tertiary))] rounded-lg text-[#135bec]">
            <Users size={24} />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase">
              Active Drones
            </p>
            <h3 className="text-2xl font-bold mt-1">
              {groups.reduce((acc, g) => acc + g.groupDroneCount, 0)}
            </h3>
          </div>
          <div className="p-2 bg-[hsl(var(--bg-tertiary))] rounded-lg text-emerald-400">
            <Drone size={24} />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase mb-1">
              Created At
            </p>
            <h3 className="text-2xl font-bold mt-1">
              {new Date(outpost.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
              })}
            </h3>
          </div>
          <div className="p-2 bg-[hsl(var(--bg-tertiary))] rounded-lg text-[#135bec]">
            <Calendar size={24} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
