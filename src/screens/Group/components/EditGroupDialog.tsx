import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import {Edit2, XCircle} from 'lucide-react';

interface DeleteGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetGroupName: string;
  input: string;
  setInput: (val: string) => void;
  onConfirm: () => void;
  error?: string | null;
}

export function EditGroupDialog({
  open,
  onOpenChange,
  targetGroupName,
  input,
  setInput,
  onConfirm,
  error,
}: DeleteGroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--text-primary))] flex items-center gap-2">
            <Edit2 size={20} />
            Change Name
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Error Display Area */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-start gap-3 text-red-400">
              <XCircle size={16} className="mt-0.5 shrink-0" />
              <span className="text-xs font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs">
              New group name
            </Label>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            disabled={input === targetGroupName || input.trim().length == 0}
            className="flex-1 md:flex-none h-9 hover:text-[hsl(var(--text-primary))]/90 transition-colors"
          >
            Rename Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
