import { DroneSummaryModel, EditDroneField } from '../types';
import {
  Network,
  MapPin,
  Battery,
  ScanEye,
  ArrowUpRightFromSquareIcon,
  SlidersHorizontal,
  Construction,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Progress } from '@/components/ui/progress.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';

interface DroneListProps {
  filteredDrones: DroneSummaryModel[];
  onCameraClick: (drone: DroneSummaryModel) => void;
  onViewDetailsClick: (uuid: string) => void;
  onEditClick: (drone: DroneSummaryModel, field: EditDroneField) => void;
  onMaintenanceClick: (drone: DroneSummaryModel) => void;
  onDecommissionClick: (drone: DroneSummaryModel) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export function DroneList({
  filteredDrones,
  searchQuery,
  setSearchQuery,
  onCameraClick,
  onViewDetailsClick,
  onEditClick,
  onMaintenanceClick,
  onDecommissionClick,
}: DroneListProps) {
  const getBadgeColor = (status: DroneSummaryModel) => {
    if (!status.inFlight && status.maintenance) {
      return 'text-red-400 bg-red-400/10 border-red-400/20';
    }
    if (status.inFlight) {
      return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
    if (status.maintenance) {
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
    return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  };

  return (
    <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
      <CardHeader className="border-b border-[hsl(var(--border-primary))] pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg font-medium">Fleet Registry</CardTitle>
            <CardDescription className="text-[hsl(var(--text-muted))]">
              Manage drone registration and telemetry.
            </CardDescription>
          </div>
          <Input
            placeholder="Search by name..."
            className="w-full md:w-64 h-9 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[hsl(var(--bg-tertiary))]">
              <TableRow className="hover:bg-transparent border-[hsl(var(--border-primary))]">
                <TableHead className="w-[200px]">Identity</TableHead>
                <TableHead>Network Address</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Home Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Battery</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrones.map((drone) => (
                <TableRow
                  key={drone.uuid}
                  className="border-[hsl(var(--border-primary))] hover:bg-[hsl(var(--bg-tertiary))]/50"
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-[hsl(var(--text-primary))]">
                        {drone.name}
                      </span>
                      <span className="text-xs font-mono text-[hsl(var(--text-muted))]">
                        {drone.uuid.substring(0, 8)}...
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm font-mono text-[hsl(var(--text-secondary))]">
                      <Network size={14} />
                      {drone.address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[hsl(var(--text-muted))] w-8">Agent:</span>
                        <span className="font-mono text-[hsl(var(--text-secondary))]">
                          {drone.manager_version}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {drone.home_position ? (
                      <div className="flex items-center gap-2 text-xs font-mono text-[hsl(var(--text-secondary))]">
                        <MapPin size={14} />
                        X:{drone.home_position.x}, Y:{drone.home_position.y}
                      </div>
                    ) : (
                      <span className="text-xs text-[hsl(var(--text-muted))] italic">Not Set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`capitalize font-normal border ${getBadgeColor(drone)}`}
                    >
                      {drone.maintenance ? 'Maintenance' : drone.inFlight ? 'In Flight' : 'Ready'}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[150px]">
                    <div className="flex items-center gap-3">
                      <Battery
                        size={16}
                        className={
                          drone.remaining_percent != null && drone.remaining_percent < 20
                            ? 'text-red-400'
                            : 'text-[hsl(var(--text-secondary))]'
                        }
                      />
                      {drone.remaining_percent != null ? (
                        <>
                          <Progress
                            value={drone.remaining_percent}
                            className="h-1.5 w-full bg-[hsl(var(--bg-tertiary))]"
                          />
                          <span className="text-xs font-mono w-8 text-right">
                            {drone.remaining_percent}%
                          </span>
                        </>
                      ) : (
                        <span
                          className="text-xs font-mono text-[hsl(var(--text-secondary))]"
                          title="Drone is in the dock"
                        >
                          N/A
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCameraClick(drone)}
                        className="h-8 w-8 p-0 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]"
                        title="View Camera Feed"
                      >
                        <ScanEye size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetailsClick(drone.uuid)}
                        className="h-8 w-8 p-0 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]"
                        title="View details"
                      >
                        <ArrowUpRightFromSquareIcon size={14} />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            title="Edit properties"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
                          >
                            <SlidersHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))]"
                        >
                          <DropdownMenuItem
                            onClick={() => onEditClick(drone, 'address')}
                            className="cursor-pointer focus:bg-[hsl(var(--text-primary))]/10 focus:text-[hsl(var(--text-primary))]"
                          >
                            Change Address
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEditClick(drone, 'name')}
                            className="cursor-pointer focus:bg-[hsl(var(--text-primary))]/10 focus:text-[hsl(var(--text-primary))]"
                          >
                            Change Name
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEditClick(drone, 'version')}
                            className="cursor-pointer focus:bg-[hsl(var(--text-primary))]/10 focus:text-[hsl(var(--text-primary))]"
                          >
                            Change Agent Version
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEditClick(drone, 'group')}
                            className="cursor-pointer focus:bg-[hsl(var(--text-primary))]/10 focus:text-[hsl(var(--text-primary))]"
                          >
                            Change Group
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-[hsl(var(--border-primary))]/50 my-1" />

                          <DropdownMenuItem
                            title={drone.maintenance ? 'Maintenance is already active' : ''}
                            onClick={(e) => {
                              if (drone.maintenance) {
                                e.preventDefault();
                                return;
                              }
                              onMaintenanceClick(drone);
                            }}
                            className={`
                                                                        flex items-center gap-2 
                                                                        ${
                                                                          drone.maintenance
                                                                            ? 'opacity-50 cursor-not-allowed focus:bg-transparent'
                                                                            : 'cursor-pointer text-amber-500 focus:text-amber-400 focus:bg-amber-500/10'
                                                                        }`}
                            aria-disabled={drone.maintenance}
                          >
                            <Construction size={14} />
                            <span>Register maintenance</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => onDecommissionClick(drone)}
                            className="cursor-pointer text-red-500 focus:text-red-400 focus:bg-red-500/10 flex items-center gap-2"
                          >
                            <Trash2 size={14} />
                            <span>Decommission drone</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
