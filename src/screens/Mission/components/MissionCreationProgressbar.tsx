import {useEffect, useRef, useState} from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import {ProgressState} from "@/screens/Mission/types.ts";

interface MissionCreationProgressbarProps {
    state: ProgressState | null;
}

export function MissionCreationProgressbar({ state }: MissionCreationProgressbarProps) {
    const [progress, setProgress] = useState(0);

    const pendingResult = useRef<'success' | 'error' | null>(null);

    useEffect(() => {
        if (state !== 'calculating') return;

        setProgress(0);
        pendingResult.current = null;
        const totalDuration = 2000 + Math.random() * 2000;
        const startTime = Date.now();

        const tick = () => {
            const elapsed = Date.now() - startTime;
            const ratio = elapsed / totalDuration;

            let reachedEnd = false;

            setProgress((prev) => {
                const maxAllowed = pendingResult.current ? 100 : Math.min(ratio * 100, 88);
                if (prev >= maxAllowed) {
                    reachedEnd = prev >= 100;
                    return prev;
                }
                const increment = 1 + Math.random() * 3;
                const next = Math.min(prev + increment, maxAllowed);
                reachedEnd = next >= 100;
                return next;
            });

            if (!reachedEnd) {
                setTimeout(tick, 50 + Math.random() * 50);
            }
        };

        tick();
    }, [state]);

    useEffect(() => {
        if (state === 'success' || state === 'error') {
            pendingResult.current = state;
        }
    }, [state]);

    const displayState = progress >= 100 ? pendingResult.current ?? state : 'calculating';

    if (!state) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-[2000] flex items-center justify-center">
            <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-6 w-80 space-y-4">
                {displayState && (
                    <>
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Compiling mission paths...</p>
                        <div className="w-full bg-[hsl(var(--bg-secondary))] rounded-full h-1.5">
                            <div
                                className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs font-mono text-[hsl(var(--text-muted))]">{Math.round(progress)}%</p>
                    </>
                )}

                {displayState === 'success' && (
                    <div className="flex flex-col items-center gap-3 py-2">
                        <CheckCircle className="text-emerald-400" size={32} />
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Mission initialized</p>
                    </div>
                )}

                {displayState === 'error' && progress == 100 && (
                    <div className="flex flex-col items-center gap-3 py-2">
                        <XCircle className="text-red-400" size={32} />
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Failed to create mission</p>
                        <p className="text-xs text-[hsl(var(--text-muted))]">Check logs and try again</p>
                    </div>
                )}
            </div>
        </div>
    );
}