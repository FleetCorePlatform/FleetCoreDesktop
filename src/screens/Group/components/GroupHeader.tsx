import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Link } from "react-router-dom";

interface GroupHeaderProps {
    pageTitle: string;
    groupUuid?: string;
    outpostUuid?: string;
    onDeleteClick: () => void;
    onRegisterClick: () => void;
}

export function GroupHeader({
    pageTitle,
    groupUuid,
    outpostUuid,
    onDeleteClick,
    onRegisterClick
}: GroupHeaderProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
                <Link to={`/outposts/${outpostUuid}`}>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-secondary))]">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
                        <Badge variant="outline" className="text-[hsl(var(--text-muted))] border-[hsl(var(--border-primary))] font-mono">
                            {(groupUuid || "").substring(0, 8)}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <Button
                    variant="destructive"
                    onClick={onDeleteClick}
                    className="flex-1 md:flex-none h-9 bg-red-500/10 text-red-200 border border-red-500/30 hover:bg-red-500/20 hover:text-white transition-colors"
                >
                    <Trash2 size={16} className="mr-2" />
                    Delete Group
                </Button>

                <Button
                    onClick={onRegisterClick}
                    className="flex-1 md:flex-none bg-white text-black hover:bg-gray-200 h-9"
                >
                    <Plus size={16} className="mr-2" />
                    Register Drone
                </Button>
            </div>
        </div>
    );
}
