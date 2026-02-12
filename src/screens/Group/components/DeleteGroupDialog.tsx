import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { AlertTriangle } from 'lucide-react';

interface DeleteGroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    targetGroupName: string;
    input: string;
    setInput: (val: string) => void;
    onConfirm: () => void;
}

export function DeleteGroupDialog({
    open,
    onOpenChange,
    targetGroupName,
    input,
    setInput,
    onConfirm
}: DeleteGroupDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-red-400 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Delete Group
                    </DialogTitle>
                    <DialogDescription className="text-[hsl(var(--text-secondary))] pt-2">
                        This action cannot be undone. This will permanently delete the group <span className="text-[hsl(var(--text-primary))] font-medium">{targetGroupName}</span> and decommission all associated drones.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs">
                            Please type <span className="font-mono text-red-400 font-bold">{targetGroupName}</span> to confirm.
                        </Label>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]"
                            placeholder={targetGroupName}
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
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={input !== targetGroupName}
                        className="flex-1 md:flex-none h-9 bg-red-500/20 text-red-200 border border-red-500/50 hover:bg-red-500/30 hover:text-white transition-colors"
                    >
                        Delete Group
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
