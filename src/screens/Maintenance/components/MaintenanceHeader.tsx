import { ArrowLeft, Wrench } from 'lucide-react';
import { Button } from "@/components/ui/button.tsx";
import { Link } from "react-router-dom";

export function MaintenanceHeader() {
    return (
        <div className="border-b border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-secondary))] p-4 lg:px-8 lg:py-4">
            <div className="flex items-center gap-4">
                <Link to={-1 as any}>
                    <Button variant="ghost" size="icon" className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Wrench size={20} className="text-[hsl(var(--text-muted))]" />
                        Maintenance Console
                    </h1>
                </div>
            </div>
        </div>
    );
}
