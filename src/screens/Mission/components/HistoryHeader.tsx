import { Button } from "@/components/ui/button.tsx";
import { ArrowLeft } from "lucide-react";
import { NavigateFunction } from "react-router-dom";

interface HistoryHeaderProps {
    navigate: NavigateFunction;
    groupUuid?: string;
    totalSorties: number;
    totalThreats: number;
}

export function HistoryHeader({ navigate, groupUuid, totalSorties, totalThreats }: HistoryHeaderProps) {
    return (
        <div className="flex-none p-6 pb-2 z-10 bg-[hsl(var(--bg-primary))] border-b border-[hsl(var(--border-primary))]">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Mission Log</h1>
                    <p className="text-xs text-[hsl(var(--text-secondary))] uppercase tracking-widest font-mono mt-1">
                        Group {groupUuid?.substring(0, 8)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[hsl(var(--bg-secondary))] p-3 rounded-lg border border-[hsl(var(--border-primary))]">
                    <div className="text-[10px] text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">Total Sorties</div>
                    <div className="text-xl font-bold font-mono">{totalSorties}</div>
                </div>
                <div className="bg-[hsl(var(--bg-secondary))] p-3 rounded-lg border border-[hsl(var(--border-primary))]">
                    <div className="text-[10px] text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">Total Threats</div>
                    <div className={`text-xl font-bold font-mono ${totalThreats > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {totalThreats}
                    </div>
                </div>
            </div>
        </div>
    );
}
