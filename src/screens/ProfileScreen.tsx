import {
    Mail, User, LogOut, Fingerprint, Copy, Check, ShieldCheck, Users
} from 'lucide-react';
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import { useState } from "react";
import { signOut } from "aws-amplify/auth";

export interface Coordinator {
    uuid: string;
    email: string;
    firstName: string;
    lastName: string;
    groups: Array<string>;
}

export interface CoordinatorProfileScreenProps {
    profile: Coordinator | null;
}

export default function CoordinatorProfileScreen({ profile }: CoordinatorProfileScreenProps) {
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await signOut();
        } catch (error) {
            console.error("Error signing out: ", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (profile?.uuid) {
            navigator.clipboard.writeText(profile.uuid);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!profile) {
        return (
            <div className="flex h-full items-center justify-center text-[hsl(var(--text-secondary))]">
                <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--accent))]"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-auto">
            <div className="max-w-[600px] mx-auto w-full p-4 lg:p-8 space-y-6">

                {/* Header Section */}
                <div className="flex flex-col items-center text-center space-y-1 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                    <p className="text-[hsl(var(--text-secondary))]">Manage your coordinator profile and session</p>
                </div>

                {/* Identity Card */}
                <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] overflow-hidden">
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

                    <CardContent className="space-y-6 pt-6">
                        {/* Personal Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider">First Name</Label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-2.5 text-[hsl(var(--text-muted))]" />
                                    <Input
                                        value={profile.firstName}
                                        readOnly
                                        className="pl-9 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))] text-[hsl(var(--text-primary))]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider">Last Name</Label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-2.5 text-[hsl(var(--text-muted))]" />
                                    <Input
                                        value={profile.lastName}
                                        readOnly
                                        className="pl-9 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))] text-[hsl(var(--text-primary))]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Groups / Roles Section */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider">Assigned Groups</Label>
                            <div className="relative">
                                <Users size={16} className="absolute left-3 top-3 text-[hsl(var(--text-muted))]" />
                                <div className="pl-9 min-h-[2.5rem] bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-secondary))] rounded-md p-2 flex flex-wrap gap-2 items-center">
                                    {profile.groups && profile.groups.length > 0 ? (
                                        profile.groups.map((group, index) => (
                                            <Badge key={index} variant="secondary" className="bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-primary))] border-[hsl(var(--border-primary))]">
                                                {group}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-[hsl(var(--text-muted))] italic">No groups assigned</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* System ID with Copy */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider">Coordinator UUID</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Fingerprint size={16} className="absolute left-3 top-2.5 text-[hsl(var(--text-muted))]" />
                                    <Input
                                        value={profile.uuid}
                                        readOnly
                                        className="pl-9 font-mono text-xs bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))] text-[hsl(var(--text-muted))]"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={copyToClipboard}
                                    className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))] hover:bg-[hsl(var(--bg-primary))]"
                                >
                                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                </Button>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-[hsl(var(--bg-tertiary))]/30 border-t border-[hsl(var(--border-primary))] p-6">
                        <Button
                            onClick={handleLogout}
                            disabled={loading}
                            variant="outline"
                            className="w-full bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] hover:border-[hsl(var(--border-secondary))] transition-all"
                        >
                            <LogOut size={16} className="mr-2" />
                            {loading ? 'Signing out...' : 'Sign Out'}
                        </Button>
                    </CardFooter>
                </Card>

                <p className="text-center text-xs text-[hsl(var(--text-muted))]">
                    Session ID: {profile.uuid.substring(0, 8)}...
                </p>
            </div>
        </div>
    );
}