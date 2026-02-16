import { Outpost } from "@/screens/Outpost/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Trash2 } from 'lucide-react';

interface OutpostDecommissionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    outpost: Outpost | null;
    input: string;
    setInput: (val: string) => void;
    error?: string | null;
    onConfirm: () => void;
}

export function OutpostDecommissionDialog({
    open,
    onOpenChange,
    outpost,
    input,
    setInput,
    error,
    onConfirm
}: OutpostDecommissionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="z-500 bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-red-400 flex items-center gap-2">
                        <Trash2 size={20} />
                        Decommission Outpost
                    </DialogTitle>
                    <DialogDescription className="text-[hsl(var(--text-secondary))] pt-2">
                        <span className="block mb-4">
                            Are you sure you want to decommission <span className="text-[hsl(var(--text-primary))] font-medium">{outpost?.name}</span>?
                            This action is irreversible and will remove the outpost and its geofence data.
                        </span>

                        <span className="block rounded bg-amber-500/10 border border-amber-500/20 p-3 text-amber-500 text-sm">
                            <span className="font-semibold">Note:</span> Only empty outposts can be deleted.
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs">
                            Please type <span className="font-mono text-red-400 font-bold">{outpost?.name}</span> to confirm.
                        </Label>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]"
                            placeholder={outpost?.name}
                        />
                    </div>
                    {error && (
                        <div className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 p-2 rounded">
                            {error}
                        </div>
                    )}
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
                        disabled={input !== outpost?.name}
                        className="flex-1 md:flex-none h-9 bg-red-500/20 text-red-200 border border-red-500/50 hover:bg-red-500/30 hover:text-white transition-colors"
                    >
                        Decommission
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
