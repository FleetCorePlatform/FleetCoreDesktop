import {
    AccordionMultiselectContent,
    AccordionMultiselectTrigger,
} from '@/components/ui/accordion-multiselect';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DroneSummaryModel } from '@/screens/Group/types.ts';

interface DroneSelectProps {
    drones: DroneSummaryModel[];
    value: string | null;
    onValueChange: (value: string) => void;
}

export function DroneSingleSelect({ drones, value, onValueChange }: DroneSelectProps) {
    const selected = drones.find((d) => d.uuid === value);

    return (
        <AccordionPrimitive.Root
            type="single"
            collapsible
            className="dark:bg-input/30! border border-[hsl(var(--border-secondary))] rounded-lg! px-3"
        >
            <AccordionPrimitive.Item value="drones" className="border-b-0">
                <AccordionMultiselectTrigger>
                    {selected ? selected.name : 'Select Drone'}
                </AccordionMultiselectTrigger>
                <AccordionMultiselectContent>
                    <RadioGroup value={value ?? ''} onValueChange={onValueChange} className="gap-0">
                        {drones.map((drone) => (
                            <label
                                key={drone.uuid}
                                htmlFor={`drone-${drone.uuid}`}
                                className="flex items-center gap-3 px-2 py-1.5 rounded-md cursor-pointer transition-all border border-foreground/10 data-[state=checked]:bg-foreground/6"
                                data-state={value === drone.uuid ? 'checked' : 'unchecked'}
                            >
                                <RadioGroupItem
                                    value={drone.uuid}
                                    id={`drone-${drone.uuid}`}
                                    className="shrink-0"
                                />
                                <div className="flex flex-col gap-1 min-w-0 py-0.5">
                                    <span className="text-sm leading-tight truncate font-medium">{drone.name}</span>
                                    <span className="text-[10px] leading-tight text-[hsl(var(--text-muted))] truncate">
                                        {drone.uuid.substring(0, 6)}...
                                    </span>
                                </div>
                            </label>
                        ))}
                    </RadioGroup>
                </AccordionMultiselectContent>
            </AccordionPrimitive.Item>
        </AccordionPrimitive.Root>
    );
}