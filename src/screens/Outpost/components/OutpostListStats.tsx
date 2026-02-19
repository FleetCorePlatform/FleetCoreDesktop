import { Hexagon, Maximize, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card.tsx';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtext: string;
  color?: string;
}

function StatsCard({ title, value, icon, subtext, color = 'text-[#135bec]' }: StatsCardProps) {
  return (
    <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider">
              {title}
            </p>
            <h3 className="text-2xl font-bold text-[hsl(var(--text-primary))] mt-2">{value}</h3>
            <p className="text-xs text-[hsl(var(--text-muted))] mt-1">{subtext}</p>
          </div>
          <div
            className={`p-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] ${color}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface OutpostListStatsProps {
  outpostsCount: number;
  totalArea: number;
  avgComplexity: string;
}

export function OutpostListStats({
  outpostsCount,
  totalArea,
  avgComplexity,
}: OutpostListStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatsCard
        title="Total Outposts"
        value={outpostsCount.toString()}
        icon={<Hexagon size={24} />}
        subtext="Active zones"
      />
      <StatsCard
        title="Total Coverage"
        value={`${totalArea.toFixed(1)} km²`}
        icon={<Maximize size={24} />}
        subtext="Geofenced area"
        color="text-emerald-400"
      />
      <StatsCard
        title="Avg. Complexity"
        value={avgComplexity}
        icon={<Layers size={24} />}
        subtext="Vertices per polygon"
      />
    </div>
  );
}
