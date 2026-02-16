import { PanelLeft, Map as MapIcon, Plane, Activity, Satellite, Tag } from 'lucide-react';
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { NavigateFunction } from "react-router-dom";

interface OutpostData {
    uuid: string;
    name: string;
    latitude: number;
    longitude: number;
    boundary: Array<{ x: number; y: number }>;
}

interface MissionSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    outpost: OutpostData;
    missionAltitude: number[];
    setMissionAltitude: (val: number[]) => void;
    jobName: string;
    setJobName: (val: string) => void;
    isSubmitting: boolean;
    handleConfirmMission: () => void;
    navigate: NavigateFunction;
}

export function MissionSidebar({
       sidebarOpen,
       setSidebarOpen,
       outpost,
       missionAltitude,
       setMissionAltitude,
       jobName,
       setJobName,
       isSubmitting,
       handleConfirmMission,
       navigate
   }: MissionSidebarProps) {
    const isValidName = jobName.trim().length > 0 && jobName.length <= 64;

    return (
        <aside className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:relative
            w-full sm:w-[340px]
            flex flex-col bg-[hsl(var(--bg-secondary))] border-r border-[hsl(var(--border-primary))] 
            z-[1500] lg:z-20 shadow-2xl
            transition-transform duration-300 ease-in-out
            h-full
        `}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-[hsl(var(--border-primary))]">
                <div className="flex items-center gap-2 mb-1">
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}
                            className="h-8 w-8 -ml-2 lg:hidden md:hidden text-[hsl(var(--text-secondary))]">
                        <PanelLeft size={20}/>
                    </Button>
                    <h1 className="text-lg font-bold">New Mission</h1>
                </div>
                <p className="text-xs text-[hsl(var(--text-secondary))] pl-7">Configure autonomous flight parameters</p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-[#3b4354] scrollbar-track-transparent">

                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider flex items-center gap-2">
                        <MapIcon size={12} /> Target Zone
                    </h3>
                    <div className="space-y-2">
                        <Label className="text-xs">Outpost Designator</Label>
                        <Input
                            value={outpost.name}
                            disabled
                            className="h-9 text-sm bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-muted))]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="space-y-1.5">
                            <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">Latitude</span>
                            <Input
                                value={outpost.latitude.toFixed(6)}
                                disabled
                                className="font-mono h-9 text-xs bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-muted))]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">Longitude</span>
                            <Input
                                value={outpost.longitude.toFixed(6)}
                                disabled
                                className="font-mono h-9 text-xs bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-muted))]"
                            />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-[#282e39]"/>

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
                            <span className={`text-[10px] font-mono ${jobName.length === 64 ? 'text-amber-500' : 'text-[hsl(var(--text-muted))]'}`}>
                                {jobName.length}/64
                            </span>
                        </div>
                        <Input
                            value={jobName}
                            onChange={(e) => setJobName(e.target.value)}
                            placeholder="e.g. Survey-Alpha-01"
                            maxLength={64} // Hard limit
                            className="h-9 text-sm bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-secondary))] focus-visible:ring-1 focus-visible:ring-emerald-500/50"
                        />
                    </div>

                    {/* Altitude Slider */}
                    <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-end">
                            <Label className="text-xs">Survey Altitude (AGL)</Label>
                            <span className="font-mono text-sm font-bold text-emerald-400">{missionAltitude[0]}m</span>
                        </div>

                        <Slider
                            defaultValue={[50]}
                            max={120}
                            min={20}
                            step={5}
                            value={missionAltitude}
                            onValueChange={setMissionAltitude}
                            className="py-2"
                        />

                        <div className="flex justify-between text-[10px] text-[hsl(var(--text-secondary))] font-mono uppercase">
                            <span>High Res (20m)</span>
                            <span>Fast Scan (120m)</span>
                        </div>
                    </div>

                    <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-xs text-[hsl(var(--text-secondary))]">
                        <p className="leading-relaxed">
                            <strong>Note:</strong> Flight path will be auto-generated based on the defined boundary polygon.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 lg:pb-[5.3em] md:pb-[4.5em] pb-[4.5em] border-t border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-secondary))] space-y-2">
                <Button
                    className="w-full h-9 text-sm bg-white text-black hover:bg-gray-200"
                    disabled={isSubmitting || !isValidName}
                    onClick={handleConfirmMission}
                >
                    {isSubmitting ? (
                        <><Activity className="animate-spin mr-2 h-4 w-4" /> Initializing...</>
                    ) : (
                        <><Satellite className="mr-2 h-4 w-4" /> Confirm Mission</>
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