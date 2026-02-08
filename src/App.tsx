import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser, signOut, fetchUserAttributes } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

import { ThemeProvider } from "@/ThemeProvider.tsx";
import Layout from "./components/Layout";
import LoginScreen from "./screens/LoginScreen";

import DashboardScreen from "./screens/DashboardScreen";
import OutpostListScreen from "@/screens/Outpost/OutpostScreen.tsx";
import OutpostCreationScreen from "./screens/Outpost/OutpostCreationScreen.tsx";
import OutpostOverviewScreen from "@/screens/Outpost/OutpostOverviewScreen.tsx";
import GroupOverviewScreen from "@/screens/Group/GroupOverviewScreen.tsx";
import MissionCreationScreen from "@/screens/MissionCreationScreen.tsx";
import CoordinatorProfileScreen, { Coordinator } from "./screens/ProfileScreen";

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
    const [profile, setProfile] = useState<Coordinator | null>(null);

    useEffect(() => {
        checkSession();

        const hubListener = Hub.listen('auth', ({ payload }) => {
            if (payload.event === 'signedIn') {
                setIsAuthenticated(true);
                checkSession();
            }
            if (payload.event === 'signedOut') {
                setIsAuthenticated(false);
                setProfile(null);
            }
        });

        return () => hubListener();
    }, []);

    async function checkSession() {
        try {
            const user = await getCurrentUser();
            setIsAuthenticated(!!user);
            if (user) loadProfile(user);
        } catch (error) {
            setIsAuthenticated(false);
        } finally {
            setIsAuthChecking(false);
        }
    }

    async function loadProfile(user: any) {
        try {
            const attributes = await fetchUserAttributes();
            setProfile({
                uuid: user.userId || user.username,
                email: attributes.email || user.username,
                firstName: attributes.given_name || 'Coordinator',
                lastName: attributes.family_name || 'User'
            });
        } catch (e) {
            console.error("Failed to load attributes", e);
        }
    }

    async function handleSignOut() {
        try {
            await signOut();
            setIsAuthenticated(false);
            setProfile(null);
        } catch (error) {
            console.error("Error signing out", error);
        }
    }

    // 2. Loading State (Prevent flicker)
    if (isAuthChecking) {
        return (
            <ThemeProvider>
                <div className="flex h-screen w-full items-center justify-center bg-[hsl(var(--bg-primary))]">
                    <div className="animate-pulse text-[hsl(var(--accent))]">Initializing Grid...</div>
                </div>
            </ThemeProvider>
        );
    }

    // 3. Unauthenticated State
    if (!isAuthenticated) {
        return (
            <ThemeProvider>
                <LoginScreen onLoginSuccess={() => {
                    setIsAuthenticated(true);
                    checkSession(); // Re-fetch attributes
                }} />
            </ThemeProvider>
        );
    }

    // 4. Authenticated State
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout signOut={handleSignOut} />}>
                        <Route path="/" element={<DashboardScreen />} />
                        <Route path="/outposts" element={<OutpostListScreen />} />
                        <Route path="/outposts/new" element={<OutpostCreationScreen />} />
                        <Route path="/outposts/:outpostUuid" element={<OutpostOverviewScreen />} />
                        <Route path="/groups/:groupUuid/:outpostUuid" element={<GroupOverviewScreen />} />
                        <Route path="/missions/new/:groupUUID" element={<MissionCreationScreen />} />
                        <Route path="/profile" element={<CoordinatorProfileScreen profile={profile} />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}