import { DroneSummaryModel, MAINTENANCE_TYPES } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Label } from '@/components/ui/label.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { Construction } from 'lucide-react';

interface MaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drone: DroneSummaryModel | null;
  form: { type: string; description: string };
  setForm: (val: { type: string; description: string }) => void;
  loading: boolean;
  onCreate: () => void;
}

export function MaintenanceDialog({
  open,
  onOpenChange,
  drone,
  form,
  setForm,
  loading,
  onCreate,
}: MaintenanceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Construction size={18} className="text-amber-500" />
            Schedule Maintenance
          </DialogTitle>
          <DialogDescription className="text-[hsl(var(--text-secondary))]">
            Create a new maintenance ticket for{' '}
            <span className="font-mono font-medium text-[hsl(var(--text-primary))]">
              {drone?.name}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Drone Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-[hsl(var(--text-muted))]">Target Drone</Label>
              <div className="text-sm font-medium border border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-tertiary))]/50 px-3 py-2 rounded-md">
                {drone?.name}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-[hsl(var(--text-muted))]">UUID</Label>
              <div className="text-sm font-mono border border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-tertiary))]/50 px-3 py-2 rounded-md truncate">
                {drone?.uuid}
              </div>
            </div>
          </div>

          {/* Maintenance Type */}
          <div className="space-y-2">
            <Label htmlFor="maint-type">Maintenance Type</Label>
            <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
              <SelectTrigger
                id="maint-type"
                className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]"
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]">
                {MAINTENANCE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="maint-desc">Description & Notes</Label>
            <textarea
              id="maint-desc"
              className="flex min-h-[100px] w-full rounded-md border border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-tertiary))] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe the issue or required task..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]"
          >
            Cancel
          </Button>
          <Button
            onClick={onCreate}
            disabled={loading || !form.description}
            className="bg-amber-600 text-white hover:bg-amber-700"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Creating...
              </span>
            ) : (
              'Create Ticket'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
