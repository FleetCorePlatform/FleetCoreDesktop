import { ArrowLeft, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigateFunction } from "react-router-dom";
import { Detection } from "@/screens/Mission/types";

interface DetectionHeaderProps {
    navigate: NavigateFunction;
    missionUuid?: string;
    detections: Detection[];
}

export function DetectionHeader({ navigate, missionUuid, detections }: DetectionHeaderProps) {
    return (
        <div className="flex-none h-16 border-b border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-secondary))] flex items-center justify-between px-4 md:px-6 z-10">
            <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="flex-none text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
                >
                    <ArrowLeft size={20} />
                </Button>

                <div className="flex flex-col justify-center overflow-hidden min-w-0">
                    <h1 className="text-sm md:text-lg font-bold tracking-tight flex items-center gap-2 whitespace-nowrap">
                        <AlertTriangle size={16} className="text-amber-500 flex-none" />
                        Threat Review
                    </h1>
                    <p className="text-[10px] text-[hsl(var(--text-secondary))] uppercase tracking-widest truncate">
                        Mission: {missionUuid?.substring(0, 8)}...
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 flex-none ml-2">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--bg-tertiary))] rounded-md border border-[hsl(var(--border-primary))]">
                    <span className="text-[10px] text-[hsl(var(--text-muted))] uppercase">Pending Review</span>
                    <span className="text-xs font-bold text-amber-500">{detections.filter(d => d.false_positive === null).length}</span>
                </div>

                {/* Mobile download button */}
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 md:w-auto md:px-3 md:gap-2 text-xs flex-none">
                    <Download size={14} />
                    <span className="hidden md:inline">Export Report</span>
                </Button>
            </div>
        </div>
    );
}