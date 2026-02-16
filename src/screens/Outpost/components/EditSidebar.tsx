import { Button } from "@/components/ui/button.tsx";
import { ArrowLeft, Crosshair, Save, Loader2 } from 'lucide-react';
import { Link, NavigateFunction } from "react-router-dom";

interface EditSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    navigate: NavigateFunction;
    name: string;
    liveVertexCount: number;
    saving: boolean;
    handleSave: () => void;
}

export function EditSidebar({
    sidebarOpen,
    navigate,
    name,
    liveVertexCount,
    saving,
    handleSave
}: EditSidebarProps) {
    return (
        <aside className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:relative
            w-full sm:w-[340px]
            flex flex-col bg-[hsl(var(--bg-secondary))] border-r border-[hsl(var(--border-primary))] 
            z-[1500] lg:z-20 shadow-2xl
            transition-transform duration-300 ease-in-out
            h-[calc(100vh-57px)]
        `}>
            <div className="px-5 py-4 border-b border-[hsl(var(--border-primary))]">
                <div className="flex items-center gap-2 mb-1">
                    <Link to="/outposts">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8 -ml-2 text-[hsl(var(--text-secondary))]">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <h1 className="text-lg font-bold">Edit Geofence</h1>
                </div>
                <p className="text-xs text-[hsl(var(--text-secondary))] pl-7">Modify operational zone parameters</p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-[#3b4354] scrollbar-track-transparent">

                <div className="grid grid-cols-[2fr_1fr] gap-3">
                    <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-2.5">
                        <div className="text-[hsl(var(--text-secondary))] text-[10px] mb-1 uppercase tracking-wider">Designator</div>
                        <div className="text-sm font-bold text-[hsl(var(--text-primary))] truncate" title={name}>{name}</div>
                    </div>
                    <div className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg p-2.5">
                        <div className="text-[hsl(var(--text-secondary))] text-[10px] mb-1 uppercase tracking-wider">Vertices</div>
                        <div className="text-sm font-bold text-[hsl(var(--text-primary))]">{liveVertexCount}</div>
                    </div>
                </div>

                <div className="p-3 rounded bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-primary))] text-xs text-[hsl(var(--text-primary))] flex gap-2">
                    <Crosshair size={16} className="shrink-0 mt-0.5" />
                    <div>Drag the white handles on the map to resize.</div>
                </div>
            </div>

            <div className="p-5 border-t border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-secondary))] space-y-2">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full h-9 text-sm bg-white text-black hover:bg-gray-200"
                >
                    {saving ? (
                        <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Saving...</>
                    ) : (
                        <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                    )}
                </Button>
                <Button
                    variant="outline"
                    onClick={() => navigate("/outposts")}
                    className="w-full h-9 text-sm border-[hsl(var(--border-secondary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]"
                >
                    Cancel
                </Button>
            </div>
        </aside>
    );
}
