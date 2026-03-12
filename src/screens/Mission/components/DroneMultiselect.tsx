import {
    AccordionMultiselect,
    AccordionMultiselectContent,
    AccordionMultiselectItem,
    AccordionMultiselectOption,
    AccordionMultiselectTrigger,
} from '@/components/ui/accordion-multiselect';
import { DroneSummaryModel } from '@/screens/Group/types.ts';
import React from 'react';

export function DroneMultiSelect({
     drones,
     value,
     onValueChange,
 }: {
    drones: DroneSummaryModel[];
    value: string[];
    onValueChange: React.Dispatch<React.SetStateAction<string[]>>;
}) {
    return (
        <AccordionMultiselect
            value={value}
            onValueChange={onValueChange}
            className="dark:bg-input/30! border border-[hsl(var(--border-secondary))] rounded-lg! px-3"
        >
            <AccordionMultiselectItem value="drones">
                <AccordionMultiselectTrigger>
                    {value.length > 0 ? `${value.length} drone(s) selected` : 'Select Drones'}
                </AccordionMultiselectTrigger>
                <AccordionMultiselectContent>
                    {drones.map((drone) => (
                        <AccordionMultiselectOption
                            key={drone.uuid}
                            value={drone.uuid}
                            showCheckbox
                            className="px-2 py-1.5"
                        >
                            <div className="flex flex-col gap-1 min-w-0 py-0.5">
                                <span className="text-sm leading-tight truncate font-medium">{drone.name}</span>
                                <span className="text-[10px] leading-tight text-[hsl(var(--text-muted))] truncate">
                                    {drone.uuid.substring(0, 6)}...
                                </span>
                            </div>
                        </AccordionMultiselectOption>
                    ))}
                </AccordionMultiselectContent>
            </AccordionMultiselectItem>
        </AccordionMultiselect>
    );
}