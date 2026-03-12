import {DroneHomePositionModel, DroneSummaryModel, EditDroneField} from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import {Crosshair} from "lucide-react";
import {MapContainer, TileLayer} from "react-leaflet";
import {LocationSelector} from "@/screens/Group/utils/common.tsx";

interface EditDroneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drone: DroneSummaryModel | null;
  field: EditDroneField | null;
  value: string;
  onValueChange: (val: string) => void;
  homePositionValue: DroneHomePositionModel;
  onHomePositionValueChange: (val: DroneHomePositionModel) => void;
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
  homePositionValue,
  onHomePositionValueChange,
  onSave,
  error,
}: EditDroneDialogProps) {
  const title = field === 'version'
      ? 'Edit Agent Version'
      : field === 'homePosition'
          ? 'Edit Home Position'
          : field
              ? `Edit ${field.charAt(0).toUpperCase() + field.slice(1)}`
              : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-[hsl(var(--text-secondary))]">
            Update the {field != 'homePosition' ? field : 'home position'} for drone <span className="font-mono text-[hsl(var(--text-primary))]">{drone?.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            {field !== 'homePosition' &&
                <Label htmlFor="edit-value" className="text-[hsl(var(--text-secondary))]">
                  {field === 'address'
                    ? 'Public IP Address'
                      : field === 'version'
                        ? 'Version Tag'
                        : 'New Name'}
               </Label>
            }

            {field === 'homePosition' ? (
                <div className="relative h-48 rounded-lg overflow-hidden border border-[hsl(var(--border-primary))]">
                  <MapContainer
                      center={homePositionValue ? [homePositionValue.y, homePositionValue.x] : [0.0, 0.0]}
                      zoom={12}
                      style={{ height: '100%', width: '100%' }}
                      zoomControl={false}
                  >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <LocationSelector
                        position={homePositionValue ? { lat: homePositionValue.y, lng: homePositionValue.x } : null}
                        onLocationSelect={(lat, lng) => onHomePositionValueChange({
                          x: lng,
                          y: lat,
                          z: homePositionValue?.z ?? 0
                        })}
                    />
                  </MapContainer>
                  {!homePositionValue && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                        <div className="bg-black/70 px-3 py-1.5 rounded-full text-xs text-white flex items-center gap-2">
                          <Crosshair size={14} />
                          Click map to set new home position
                        </div>
                      </div>
                  )}
                  {homePositionValue && (
                      <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-[10px] font-mono text-white pointer-events-none">
                        {homePositionValue.x.toFixed(5)}, {homePositionValue.y.toFixed(5)}
                      </div>
                  )}
                </div>
            ) : (
                <Input
                    id="edit-value"
                    value={value}
                    onChange={(e) => onValueChange(e.target.value)}
                    className={`bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))] ${error ? 'border-red-500' : ''}`}
                />
            )}

            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
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
          <Button onClick={onSave} className="bg-white text-black hover:bg-gray-200">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
