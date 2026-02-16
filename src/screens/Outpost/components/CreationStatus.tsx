interface CreationStatusProps {
    isClosed: boolean;
}

export function CreationStatus({ isClosed }: CreationStatusProps) {
    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] px-4 max-w-md w-full">
            <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--bg-tertiary))]/95 backdrop-blur border border-[hsl(var(--border-primary))] rounded-full shadow-xl">
                <span className="relative flex h-2 w-2 shrink-0">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isClosed ? 'bg-emerald-400' : 'bg-yellow-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isClosed ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                </span>
                <span className="text-xs text-[hsl(var(--text-secondary))] truncate">
                    {isClosed ? "Zone Defined. Ready to create." : "Drawing Mode Active. Click to add points."}
                </span>
                {!isClosed && (
                    <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-[hsl(var(--border-secondary))] bg-[#282e39] px-1.5 font-mono text-[10px] font-medium text-[hsl(var(--text-secondary))] shrink-0">
                        ESC
                    </kbd>
                )}
            </div>
        </div>
    );
}
