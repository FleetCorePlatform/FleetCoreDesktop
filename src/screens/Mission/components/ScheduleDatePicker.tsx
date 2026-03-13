import { Label } from "@/components/ui/label.tsx"
import { Switch } from "@/components/ui/switch.tsx"
import {DateTimePicker24h} from "@/components/ui/datetime-picker.tsx";

export interface ScheduleDatePickerProps {
    schedulerEnabled: boolean;
    setSchedulerEnabled: (val: boolean) => void;
    scheduledDate: string;
    setScheduledDate: (val: string) => void;
    scheduledTime: string;
    setScheduledTime: (val: string) => void;
}

export function ScheduleDatePicker({
       schedulerEnabled,
       setSchedulerEnabled,
       scheduledDate,
       setScheduledDate,
       scheduledTime,
       setScheduledTime,
   }: ScheduleDatePickerProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <Label className="text-xs">Schedule Mission</Label>
                    <span className="text-[10px] text-[hsl(var(--text-muted))]">
                        Delay execution until specified time
                    </span>
                </div>
                <Switch
                    checked={schedulerEnabled}
                    onCheckedChange={(checked) => {
                        setSchedulerEnabled(checked);
                        if (!checked) {
                            setScheduledDate('');
                            setScheduledTime('');
                        }
                    }}
                />
            </div>

            {schedulerEnabled && (
                <div className="flex flex-col gap-4 pt-2 border-t border-[hsl(var(--border-secondary))]">
                    <DateTimePicker24h
                        scheduledDate={scheduledDate}
                        setScheduledDate={setScheduledDate}
                        scheduledTime={scheduledTime}
                        setScheduledTime={setScheduledTime}
                    />
                </div>
            )}
        </div>
    )
}