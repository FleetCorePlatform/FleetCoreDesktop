import { AlertTriangle, ShieldCheck, Clock, Trash2, CheckCircle2, User } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { MaintenanceRecord } from '../types';

interface MaintenanceListProps {
  pendingRecords: MaintenanceRecord[];
  historyRecords: MaintenanceRecord[];
  typeFilter: string | null;
  handleDelete: (id: string) => void;
  handleComplete: (id: string) => void;
  getTypeColor: (type: string) => string;
}

export function MaintenanceList({
  pendingRecords,
  historyRecords,
  typeFilter,
  handleDelete,
  handleComplete,
  getTypeColor,
}: MaintenanceListProps) {
  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-primary))] mb-6">
        <TabsTrigger value="pending" className="data-[state=active]:bg-[hsl(var(--bg-tertiary))]">
          <AlertTriangle size={14} className="mr-2" /> Pending ({pendingRecords.length})
        </TabsTrigger>
        <TabsTrigger value="history" className="data-[state=active]:bg-[hsl(var(--bg-tertiary))]">
          <ShieldCheck size={14} className="mr-2" /> History ({historyRecords.length})
        </TabsTrigger>
      </TabsList>

      {/* --- PENDING TAB --- */}
      <TabsContent value="pending" className="space-y-4">
        {pendingRecords.length === 0 && (
          <div className="text-center py-12 border border-dashed border-[hsl(var(--border-primary))] rounded-lg text-[hsl(var(--text-secondary))]">
            {typeFilter
              ? 'No active requests match this filter.'
              : 'No active maintenance requests.'}
          </div>
        )}
        {pendingRecords.map((record) => (
          <Card
            key={record.uuid}
            className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] hover:border-[hsl(var(--border-secondary))] transition-all group"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${getTypeColor(record.maintenance_type)}`}>
                      {record.maintenance_type.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm font-mono text-[hsl(var(--text-muted))]">
                      {record.drone_name}
                    </span>
                  </div>
                  <CardTitle className="text-base font-medium pt-1">{record.description}</CardTitle>
                </div>
                <div className="text-xs text-[hsl(var(--text-muted))] font-mono flex items-center bg-[hsl(var(--bg-primary))] px-2 py-1 rounded">
                  {record.drone_group_name}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-2 text-xs text-[hsl(var(--text-secondary))] mt-2">
                <Clock size={12} />
                Created: {new Date(record.created_at).toLocaleString()}
              </div>
            </CardContent>
            <CardFooter className="pt-2 flex justify-end gap-2 border-t border-[hsl(var(--border-primary))] mt-2 bg-[hsl(var(--bg-tertiary))]/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(record.uuid)}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8"
              >
                <Trash2 size={14} className="mr-1.5" /> Dismiss
              </Button>
              <Button
                size="sm"
                onClick={() => handleComplete(record.uuid)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white h-8"
              >
                <CheckCircle2 size={14} className="mr-1.5" /> Mark Complete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </TabsContent>

      {/* --- HISTORY TAB --- */}
      <TabsContent value="history" className="space-y-4">
        {historyRecords.length === 0 && (
          <div className="text-center py-12 border border-dashed border-[hsl(var(--border-primary))] rounded-lg text-[hsl(var(--text-secondary))]">
            No maintenance history found.
          </div>
        )}
        {historyRecords.map((record) => (
          <Card
            key={record.uuid}
            className="bg-[hsl(var(--bg-secondary))]/50 border-[hsl(var(--border-primary))] opacity-80 hover:opacity-100 transition-opacity"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-[hsl(var(--text-muted))] border-[hsl(var(--border-primary))]"
                    >
                      {record.maintenance_type.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm font-mono text-[hsl(var(--text-muted))] line-through decoration-zinc-500">
                      {record.drone_name}
                    </span>
                  </div>
                  <CardTitle className="text-base font-medium pt-1 text-[hsl(var(--text-secondary))]">
                    {record.description}
                  </CardTitle>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-0">COMPLETED</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 p-3 bg-[hsl(var(--bg-tertiary))] rounded text-xs text-[hsl(var(--text-secondary))]">
                <div className="flex items-center gap-2">
                  <User size={12} />
                  <span>
                    Coordinator:{' '}
                    <span className="font-mono text-[hsl(var(--text-secondary))]">
                      {record.performed_by}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={12} />
                  <span>Completed at: {new Date(record.performed_at!).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
}
