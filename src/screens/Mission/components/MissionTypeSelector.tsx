import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MissionType } from '@/screens/Mission/types.ts';

export interface MissionTypeSelectorProps {
  onSelectionChanged: (value: MissionType) => void;
  value: MissionType;
}

export function MissionTypeSelector({ onSelectionChanged, value }: MissionTypeSelectorProps) {
  return (
      <RadioGroup onValueChange={onSelectionChanged} value={value} className="flex max-w flex-col gap-3">
        <FieldLabel htmlFor="full-mission" className="cursor-pointer bg-[hsl(var(--bg-tertiary))]">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Full</FieldTitle>
              <FieldDescription>
                Full area coverage with all available drone in this group
              </FieldDescription>
            </FieldContent>
            <RadioGroupItem value="FULL" id="full-mission" />
          </Field>
        </FieldLabel>
        <FieldLabel htmlFor="subset-mission" className="cursor-pointer bg-[hsl(var(--bg-tertiary))]">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Subset</FieldTitle>
              <FieldDescription>Full area coverage with a selected set of drones</FieldDescription>
            </FieldContent>
            <RadioGroupItem value="SUBSET" id="subset-mission" />
          </Field>
        </FieldLabel>
        <FieldLabel htmlFor="solo-mission" className="cursor-pointer bg-[hsl(var(--bg-tertiary))]">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Solo</FieldTitle>
              <FieldDescription>Manually planned mission for a single drone</FieldDescription>
            </FieldContent>
            <RadioGroupItem value="SOLO" id="solo-mission" />
          </Field>
        </FieldLabel>
      </RadioGroup>
  );
}