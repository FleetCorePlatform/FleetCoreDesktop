import {
    Mail, UserCircle, LogOut
} from 'lucide-react';
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { useState } from "react";
import { signOut } from "aws-amplify/auth"; // <--- Import signOut

export interface Coordinator {
    uuid: string;
    email: string;
    firstName: string;
    lastName: string;
}

export interface CoordinatorProfileScreenProps {
    profile: Coordinator | null;
}

export default function CoordinatorProfileScreen({ profile }: CoordinatorProfileScreenProps) {
    const [loading, setLoading] = useState(false);

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

    if (!profile) {
        return <div className="p-6 text-center">Loading profile...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-[600px] mx-auto p-4 lg:p-6 space-y-6">

                    {/* Page Header */}
                    <div className="text-center space-y-2">
                        <div className="w-20 h-20 bg-[hsl(var(--accent))]/20 border-2 border-[hsl(var(--accent))] rounded-full flex items-center justify-center mx-auto">
                            <UserCircle size={40} className="text-[hsl(var(--accent))]" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Coordinator Profile</h1>
                        <p className="text-sm text-[hsl(var(--text-secondary))]">
                            Manage your session and credentials
                        </p>
                    </div>

                    {/* Profile Form */}
                    <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))]">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Current Session
                            </CardTitle>
                            <CardDescription className="text-[hsl(var(--text-secondary))]">
                                Identity provided by Cognito
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">

                            {/* Email */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-[hsl(var(--accent))]" />
                                    <Label className="text-sm text-[hsl(var(--text-primary))]">Email Address</Label>
                                </div>
                                <Input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))] h-10 cursor-not-allowed opacity-80"
                                />
                            </div>

                            <div className="h-px bg-[#282e39]" />

                            {/* First Name */}
                            <div className="space-y-2">
                                <Label className="text-sm text-[hsl(var(--text-primary))]">First Name</Label>
                                <Input
                                    value={profile.firstName}
                                    disabled
                                    className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))] h-10 cursor-not-allowed opacity-80"
                                />
                            </div>

                            {/* Last Name */}
                            <div className="space-y-2">
                                <Label className="text-sm text-[hsl(var(--text-primary))]">Last Name</Label>
                                <Input
                                    value={profile.lastName}
                                    disabled
                                    className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))] h-10 cursor-not-allowed opacity-80"
                                />
                            </div>

                            {/* UUID (Read-only reference) */}
                            <div className="space-y-2">
                                <Label className="text-sm text-[hsl(var(--text-primary))]">User ID</Label>
                                <Input value={profile.uuid}
                                       disabled
                                       className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))] h-10 cursor-not-allowed opacity-80"/>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleLogout}
                            disabled={loading}
                            variant="destructive"
                            className="w-full h-11 font-medium bg-red-600 hover:bg-red-700 text-white"
                        >
                            <LogOut size={18} className="mr-2" />
                            {loading ? 'Signing Out...' : 'Sign Out'}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}