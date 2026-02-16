import { Mail, ShieldCheck } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Coordinator } from "../types";

interface ProfileCardHeaderProps {
    profile: Coordinator;
    initials: string;
}

export function ProfileCardHeader({ profile, initials }: ProfileCardHeaderProps) {
    return (
        <>
            <div className="h-24 bg-gradient-to-r from-[hsl(var(--bg-tertiary))] to-[hsl(var(--bg-secondary))] border-b border-[hsl(var(--border-primary))]" />
            <CardHeader className="relative pb-2">
                {/* Avatar */}
                <div className="absolute -top-12 left-6">
                    <div className="h-24 w-24 rounded-full border-4 border-[hsl(var(--bg-secondary))] bg-[hsl(var(--bg-tertiary))] flex items-center justify-center text-3xl font-bold text-[hsl(var(--accent))] shadow-lg">
                        {initials}
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Badge variant="outline" className="gap-1.5 py-1 px-3 border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                        <ShieldCheck size={12} />
                        Authenticated
                    </Badge>
                </div>

                <div className="pt-8 px-2">
                    <CardTitle className="text-2xl">{profile.firstName} {profile.lastName}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1 text-[hsl(var(--text-secondary))]">
                        <Mail size={14} />
                        {profile.email}
                    </CardDescription>
                </div>
            </CardHeader>
        </>
    );
}
