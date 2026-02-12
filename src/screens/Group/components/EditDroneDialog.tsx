import { DroneSummaryModel, EditDroneField } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

interface EditDroneDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    drone: DroneSummaryModel | null;
    field: EditDroneField | null;
    value: string;
    onValueChange: (val: string) => void;
    onSave: () => void;
    error: string | null;
}

export function EditDroneDialog({
    open,
    onOpenChange,
    drone,
    field,
    value,
    onValueChange,
    onSave,
    error
}: EditDroneDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit {field === 'version' ? 'Agent Version' : field ? field.charAt(0).toUpperCase() + field.slice(1) : ''}</DialogTitle>
                    <DialogDescription className="text-[hsl(var(--text-secondary))]">
                        Update the {field} for drone <span className="font-mono">{drone?.name}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-value" className="text-[hsl(var(--text-secondary))]">
                            {field === 'address' ? 'Public IP Address' :
                                field === 'group' ? 'Target Group' :
                                    field === 'version' ? 'Version Tag' : 'New Name'}
                        </Label>

                        {field === 'group' ? (
                            <Select value={value} onValueChange={onValueChange}>
                                <SelectTrigger className="w-full bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))]">
                                    <SelectValue placeholder="Select a group" />
                                </SelectTrigger>
                                <SelectContent className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))]">
                                    {["a", "d"].map(g => (
                                        <SelectItem key={g} value={g} className="focus:bg-[hsl(var(--text-primary))]/10 focus:text-[hsl(var(--text-primary))]">{g}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                id="edit-value"
                                value={value}
                                onChange={(e) => onValueChange(e.target.value)}
                                className={`bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] ${error ? 'border-red-500' : ''}`}
                            />
                        )}

                        {error && (
                            <p className="text-xs text-red-400 mt-1">{error}</p>
                        )}
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]">
                        Cancel
                    </Button>
                    <Button onClick={onSave} className="bg-white text-black hover:bg-gray-200">
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
