import {
    Bell, Settings, User, Hexagon, Mail, UserCircle, Save
} from 'lucide-react';
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { useState, useEffect } from "react";

interface Coordinator {
    uuid: string;
    email: string;
    firstName: string;
    lastName: string;
}

export default function CoordinatorProfileScreen() {
    const [coordinatorUUID, setCoordinatorUUID] = useState<string>('');
    const [coordinator, setCoordinator] = useState<Coordinator | null>(null);
    const [isNew, setIsNew] = useState(true);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: ''
    });

    useEffect(() => {
        // Try to load existing coordinator if UUID is available
        const loadProfile = async () => {
            const storedUUID = localStorage.getItem('coordinatorUUID');
            if (storedUUID) {
                setCoordinatorUUID(storedUUID);
                await fetchCoordinator(storedUUID);
            }
        };

        loadProfile();
    }, []);

    const fetchCoordinator = async (uuid: string) => {
        try {
            const res = await fetch(`/api/v1/coordinators/${uuid}`);
            const data = await res.json();
            setCoordinator(data);
            setFormData({
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName
            });
            setIsNew(false);
        } catch (error) {
            console.error('Failed to fetch coordinator:', error);
        }
    };

    const handleRegister = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Invalid email format');
            return;
        }

        if (!formData.firstName || !formData.lastName) {
            alert('Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/v1/coordinators/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            localStorage.setItem('coordinatorUUID', data.uuid);
            setCoordinatorUUID(data.uuid);
            setCoordinator(data);
            setIsNew(false);
            alert('Profile registered successfully!');
        } catch (error) {
            console.error('Failed to register:', error);
            alert('Failed to register profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!coordinatorUUID) return;

        setLoading(true);
        try {
            await fetch(`/api/v1/coordinators/update/${coordinatorUUID}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName
                })
            });

            alert('Profile updated successfully!');
            await fetchCoordinator(coordinatorUUID);
        } catch (error) {
            console.error('Failed to update:', error);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0f1115] text-white font-sans overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-[600px] mx-auto p-4 lg:p-6 space-y-6">

                    {/* Page Header */}
                    <div className="text-center space-y-2">
                        <div className="w-20 h-20 bg-[#135bec]/20 border-2 border-[#135bec] rounded-full flex items-center justify-center mx-auto">
                            <UserCircle size={40} className="text-[#135bec]" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Coordinator Profile</h1>
                        <p className="text-sm text-[#9da6b9]">
                            {isNew ? 'Register your coordinator account' : 'Manage your profile information'}
                        </p>
                    </div>

                    {/* Profile Form */}
                    <Card className="bg-[#111318] border-[#282e39]">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {isNew ? 'Registration Details' : 'Profile Information'}
                            </CardTitle>
                            <CardDescription className="text-[#9da6b9]">
                                {isNew ? 'Create your coordinator profile' : `UUID: ${coordinatorUUID}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">

                            {/* Email */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-[#135bec]" />
                                    <Label className="text-sm text-white">Email Address</Label>
                                </div>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!isNew}
                                    placeholder="coordinator@example.com"
                                    className="bg-[#1c1f27] border-[#3b4354] h-10"
                                />
                                {!isNew && (
                                    <p className="text-xs text-[#9da6b9]">Email cannot be changed after registration</p>
                                )}
                            </div>

                            <div className="h-px bg-[#282e39]" />

                            {/* First Name */}
                            <div className="space-y-2">
                                <Label className="text-sm text-white">First Name</Label>
                                <Input
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    placeholder="John"
                                    className="bg-[#1c1f27] border-[#3b4354] h-10"
                                />
                            </div>

                            {/* Last Name */}
                            <div className="space-y-2">
                                <Label className="text-sm text-white">Last Name</Label>
                                <Input
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    placeholder="Doe"
                                    className="bg-[#1c1f27] border-[#3b4354] h-10"
                                />
                            </div>

                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button
                            onClick={isNew ? handleRegister : handleUpdate}
                            disabled={loading}
                            className="w-full h-11 bg-white text-black hover:bg-gray-200 font-medium"
                        >
                            <Save size={18} className="mr-2" />
                            {loading ? 'Saving...' : (isNew ? 'Register Profile' : 'Update Profile')}
                        </Button>

                        {!isNew && (
                            <Button
                                variant="outline"
                                className="w-full h-10 border-[#3b4354] hover:bg-[#1c1f27]"
                                onClick={() => {
                                    localStorage.removeItem('coordinatorUUID');
                                    setCoordinatorUUID('');
                                    setCoordinator(null);
                                    setIsNew(true);
                                    setFormData({ email: '', firstName: '', lastName: '' });
                                }}
                            >
                                Clear Profile
                            </Button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}