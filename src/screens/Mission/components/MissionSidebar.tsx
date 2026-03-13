import {
  PanelLeft,
  Map as MapIcon,
  Plane,
  Activity,
  Satellite,
  Tag,
  Sliders,
  Crosshair,
  Group
} from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Slider } from '@/components/ui/slider.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { NavigateFunction } from 'react-router-dom';
import { OutpostSummary } from '@/screens/common/types.ts';
import {MissionType, PointCoords} from '@/screens/Mission/types.ts';
import { MissionTypeSelector } from '@/screens/Mission/components/MissionTypeSelector.tsx';
import {DroneMultiSelect} from "@/screens/Mission/components/DroneMultiselect.tsx";
import {DroneSingleSelect} from "@/screens/Mission/components/DroneSingleSelect.tsx";
import {DroneSummaryModel} from "@/screens/Group/types.ts";
import React from "react";
import {estimateMissionTime} from "@/screens/Mission/utils/common.ts";
import {ScheduleDatePicker} from "@/screens/Mission/components/ScheduleDatePicker.tsx";

interface MissionSidebarProps {
  drones: DroneSummaryModel[];
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  missionType: MissionType;
  onMissionTypeChanged: (value: MissionType) => void;
  outpost: OutpostSummary;
  jobName: string;
  returnToLaunch: boolean,
  setReturnToLaunch: (val: boolean) => void;
  missionAltitude: number[];
  setMissionAltitude: (val: number[]) => void;
  cruiseSpeed: number[];
  setCruiseSpeed: (val: number[]) => void;
  setJobName: (val: string) => void;
  selectedDrones: string[];
  setSelectedDrones: React.Dispatch<React.SetStateAction<string[]>>;
  schedulerEnabled: boolean;
  setSchedulerEnabled: (val: boolean) => void;
  scheduledDate: string;
  setScheduledDate: (val: string) => void;
  scheduledTime: string;
  setScheduledTime: (val: string) => void;
  isSubmitting: boolean;
  canSubmit: boolean;
  handleConfirmMission: () => void;
  soloWaypoints: Array<PointCoords>;
  navigate: NavigateFunction;
}

export function MissionSidebar({
  drones,
  sidebarOpen,
  setSidebarOpen,
  missionType,
  onMissionTypeChanged,
  outpost,
  jobName,
  returnToLaunch,
  setReturnToLaunch,
  missionAltitude,
  setMissionAltitude,
  cruiseSpeed,
  setCruiseSpeed,
  setJobName,
  selectedDrones,
  setSelectedDrones,
  schedulerEnabled,
  setSchedulerEnabled,
  scheduledDate,
  setScheduledDate,
  scheduledTime,
  setScheduledTime,
  isSubmitting,
  canSubmit,
  handleConfirmMission,
  soloWaypoints,
  navigate,

}: MissionSidebarProps) {
  return (
    <aside
      className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:relative
            w-full sm:w-[340px]
            flex flex-col bg-[hsl(var(--bg-secondary))] border-r border-[hsl(var(--border-primary))] 
            z-[1500] lg:z-20 shadow-2xl
            transition-transform duration-300 ease-in-out
            h-full
        `}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[hsl(var(--border-primary))]">
        <div className="flex items-center gap-2 mb-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="h-8 w-8 -ml-2 lg:hidden md:hidden text-[hsl(var(--text-secondary))]"
          >
            <PanelLeft size={20} />
          </Button>
          <h1 className="text-lg font-bold">New Mission</h1>
        </div>
        <p className="text-xs text-[hsl(var(--text-secondary))] pl-7">
          Configure mission flight parameters
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-[#3b4354] scrollbar-track-transparent">
        <div className="space-y-3">
          <p className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider flex items-center gap-2">
            <MapIcon size={12} /> Outpost Information
          </p>

          <div className="border border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-tertiary))] rounded-lg px-3 pt-2 pb-3 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))]">Outpost Name</span>
            <p className="text-sm text-[hsl(var(--text-primary))]">{outpost.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="border border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-tertiary))] rounded-lg px-3 pt-2 pb-3 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))]">Latitude</span>
              <p className="font-mono text-xs text-[hsl(var(--text-muted))]">{outpost.latitude.toFixed(6)}</p>
            </div>
            <div className="border border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-tertiary))] rounded-lg px-3 pt-2 pb-3 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))]">Longitude</span>
              <p className="font-mono text-xs text-[hsl(var(--text-muted))]">{outpost.longitude.toFixed(6)}</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#282e39]" />

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider flex items-center gap-2">
            <Sliders size={12} /> Mission Type
          </h3>

          <div className="space-y-2">
            <MissionTypeSelector value={missionType} onSelectionChanged={onMissionTypeChanged} />
          </div>
        </div>

        <div className="h-px bg-[#282e39]" />

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider flex items-center gap-2">
            <Plane size={12} /> Mission Parameters
          </h3>

          {/* Mission Name Input */}
          <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-[hsl(var(--text-secondary))]">
              <div className="flex items-center gap-2">
                <Tag size={12} />
                <Label className="text-xs">Mission Name</Label>
              </div>
              <span
                className={`text-[10px] font-mono ${jobName.length === 64 ? 'text-amber-500' : 'text-[hsl(var(--text-muted))]'}`}
              >
                {jobName.length}/64
              </span>
            </div>
            <Input
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="e.g. Routine night survey"
              maxLength={64}
              className="h-11 text-sm border-[hsl(var(--border-secondary))] focus-visible:ring-1 focus-visible:[hsl(var(--border-tertiary))]"
            />

            {(missionType === 'SUBSET' || missionType === 'SOLO') && (
              <div className="text-[hsl(var(--text-secondary))]">
                <div className="flex items-center gap-2 pt-2.5 pb-2.5">
                  { missionType === 'SOLO' ? <Crosshair size={14} /> : <Group size={14} /> }
                  <Label className="text-xs">
                    {missionType === 'SUBSET' ? 'Drone selection' : 'Target drone'}
                  </Label>
                </div>
                {missionType === 'SUBSET'
                    ? <DroneMultiSelect drones={drones} value={selectedDrones} onValueChange={setSelectedDrones} />
                    : <DroneSingleSelect
                        drones={drones}
                        value={selectedDrones[0] ?? null}
                        onValueChange={(uuid) => setSelectedDrones([uuid])}
                    />
                }
              </div>
            )}

            {missionType == 'SOLO' && (
              <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-secondary))] rounded-lg p-4 mt-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <Label className="text-xs">Return to Launch</Label>
                    <span className="text-[10px] text-[hsl(var(--text-muted))]">
                      Drone returns home after completing the mission
                    </span>
                  </div>
                  <Switch
                      checked={returnToLaunch}
                      onCheckedChange={setReturnToLaunch}
                  />
                </div>
              </div>
            )}

          </div>


          {/* Altitude Slider */}
          <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-xs">Mission Altitude (AGL)</Label>
              <span className="font-mono text-sm font-bold text-emerald-400">
                {missionAltitude[0]}m
              </span>
            </div>

            <Slider
              defaultValue={[25]}
              max={40}
              min={10}
              step={5}
              value={missionAltitude}
              onValueChange={setMissionAltitude}
              className="py-2"
            />

            <div className="flex justify-between text-[10px] text-[hsl(var(--text-secondary))] font-mono uppercase">
              <span>High Res (15m)</span>
              <span>Fast Scan (40m)</span>
            </div>
            {/* Speed Slider */}
            {missionType == 'SOLO' &&
              <>
                <div className="flex justify-between items-end">
                  <Label className="text-xs">Cruise Speed (m/s)</Label>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {cruiseSpeed[0]}m/s
                  </span>
                </div>

                <Slider
                    defaultValue={[15]}
                    max={20}
                    min={10}
                    step={1}
                    value={cruiseSpeed}
                    onValueChange={setCruiseSpeed}
                    className="py-2"
                />

                <div className="flex justify-between text-[10px] text-[hsl(var(--text-secondary))] font-mono uppercase">
                  <span>Precise (10m/s)</span>
                  <span>Aggressive (20m/s)</span>
                </div>

                <div className={"pt-2"}>
                  <div className="h-px bg-[#282e39]" />

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-[hsl(var(--text-muted))] uppercase tracking-wider">Est. flight time</span>
                    <span className="text-xs font-mono text-emerald-400">
                      {estimateMissionTime(soloWaypoints, cruiseSpeed[0])}
                    </span>
                  </div>
                </div>
              </>
            }
          </div>

          {/* Scheduled Execution */}
          <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-4">
            <ScheduleDatePicker
                schedulerEnabled={schedulerEnabled}
                setSchedulerEnabled={setSchedulerEnabled}
                scheduledDate={scheduledDate}
                setScheduledDate={setScheduledDate}
                scheduledTime={scheduledTime}
                setScheduledTime={setScheduledTime}
            />
          </div>

          {missionType != 'SOLO' &&
            <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-xs text-[hsl(var(--text-secondary))]">
              <p className="leading-relaxed">
                <strong>Note:</strong> Flight path will be auto-generated based on the defined
                boundary polygon.
              </p>
            </div>
          }
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-5 lg:pb-[1em] md:pb-[4.5em] pb-[4.5em] border-t border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-secondary))] space-y-2">
        <Button
          className="w-full h-9 text-sm bg-white text-black hover:bg-gray-200"
          disabled={!canSubmit}
          onClick={handleConfirmMission}
        >
          {isSubmitting ? (
            <>
              <Activity className="animate-spin mr-2 h-4 w-4" /> Initializing...
            </>
          ) : (
            <>
              <Satellite className="mr-2 h-4 w-4" /> Confirm Mission
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/outposts')}
          className="w-full h-9 text-sm border-[hsl(var(--border-secondary))] hover:bg-[hsl(var(--bg-tertiary))]"
        >
          Cancel
        </Button>
      </div>
    </aside>
  );
}
