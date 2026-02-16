import { AlertCircle, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { OutpostSummary } from "@/models/Outpost.ts";

interface CreateGroupDialogProps {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    outpost: OutpostSummary;
    newGroupName: string;
    setNewGroupName: (name: string) => void;
    groupNameError: string | null;
    setGroupNameError: (error: string | null) => void;
    isCreating: boolean;
    handleCreateGroup: () => void;
}

export function CreateGroupDialog({
    isDialogOpen,
    setIsDialogOpen,
    outpost,
    newGroupName,
    setNewGroupName,
    groupNameError,
    setGroupNameError,
    isCreating,
    handleCreateGroup
}: CreateGroupDialogProps) {
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                    <DialogDescription className="text-[hsl(var(--text-secondary))]">
                        Establish a new drone fleet group for this outpost.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="outpost-name" className="text-[hsl(var(--text-secondary))]">
                            Assigned Outpost
                        </Label>
                        <Input
                            id="outpost-name"
                            value={outpost.name}
                            disabled
                            className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-muted))] opacity-70 cursor-not-allowed"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="group-name" className="text-[hsl(var(--text-secondary))]">
                            Group Name
                        </Label>
                        <Input
                            id="group-name"
                            value={newGroupName}
                            onChange={(e) => {
                                setNewGroupName(e.target.value);
                                if(groupNameError) setGroupNameError(null);
                            }}
                            placeholder="e.g. alpha-squad-01"
                            className={`bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] ${groupNameError ? 'border-red-500' : ''}`}
                        />
                        {groupNameError ? (
                            <div className="flex items-center gap-1 text-xs text-red-400 mt-1">
                                <AlertCircle size={12} />
                                <span>{groupNameError}</span>
                            </div>
                        ) : (
                            <p className="text-[10px] text-[hsl(var(--text-muted))]">
                                Allowed: Alphanumeric, ':', '_', '-'. Max 128 chars.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateGroup}
                        disabled={isCreating}
                        className="bg-white text-black hover:bg-gray-200"
                    >
                        {isCreating ? "Creating..." : "Create Group"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
