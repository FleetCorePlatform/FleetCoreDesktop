import { Crosshair } from "lucide-react";

export function DetectionEmptyState() {
    return (
        <div className="hidden md:flex flex-1 items-center justify-center bg-[hsl(var(--bg-tertiary))] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]"
                 style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>
            <div className="text-center opacity-30 select-none">
                <Crosshair size={64} className="mx-auto mb-4 text-[hsl(var(--text-muted))]" />
                <h2 className="text-xl font-bold uppercase tracking-[0.2em]">Select Target</h2>
                <p className="font-mono text-xs mt-2">Awaiting operator input</p>
            </div>
        </div>
    );
}
