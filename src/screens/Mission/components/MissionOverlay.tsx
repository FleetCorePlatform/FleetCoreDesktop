import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MissionOverlayProps {
    isLoading?: boolean;
    error?: string | null;
    onDismiss?: () => void;
}

export function MissionOverlay({ isLoading, error, onDismiss }: MissionOverlayProps) {
    if (!isLoading && !error) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center">
            <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-6 flex flex-col items-center gap-3 max-w-sm w-full mx-4">
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin text-[hsl(var(--text-secondary))]" size={28} />
                        <p className="text-sm text-[hsl(var(--text-secondary))]">Loading...</p>
                    </>
                ) : (
                    <>
                        <AlertTriangle className="text-red-400" size={28} />
                        <p className="text-sm text-[hsl(var(--text-primary))] font-semibold">Warning!</p>
                        <p className="text-xs text-[hsl(var(--text-muted))] text-center">{error}</p>
                        <Button variant="outline" size="sm" className="mt-1 w-full" onClick={onDismiss}>
                            Dismiss
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}