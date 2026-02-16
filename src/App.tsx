import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser, signOut, fetchUserAttributes, fetchAuthSession } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

import { ThemeProvider } from "@/ThemeProvider.tsx";
import Layout from "./components/Layout";
import LoginScreen from "./screens/LoginScreen";

import DashboardScreen from "./screens/Dashboard/DashboardScreen";

import { UserProvider } from "@/context/UserContext.ts";
import CoordinatorProfileScreen, { Coordinator } from "./screens/Profile/ProfileScreen";
import { UserCredentials } from "@/models/User.ts";
import OutpostListScreen from "@/screens/Outpost/OutpostScreen.tsx";
import OutpostCreationScreen from "@/screens/Outpost/OutpostCreationScreen.tsx";
import OutpostOverviewScreen from "@/screens/Outpost/OutpostOverviewScreen.tsx";
import MaintenanceScreen from "@/screens/Maintenance/MaintenanceScreen.tsx";
import DroneDetailsScreen from "@/screens/Drone/DroneDetailScreen.tsx";
import OutpostEditScreen from "@/screens/Outpost/OutpostEditScreen.tsx";
import GroupOverviewScreen from "@/screens/Group/GroupOverviewScreen.tsx";
import MissionCreationScreen from "@/screens/Mission/MissionCreationScreen.tsx";
import MissionHistoryScreen from "@/screens/Mission/MissionHistoryScreen.tsx";
import DetectionReviewScreen from "@/screens/Mission/MissionDetectionsScreen.tsx";

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
    const [profile, setProfile] = useState<Coordinator | null>(null);
    const [credentials, setCredentials] = useState<UserCredentials | null>(null);

    useEffect(() => {
        checkSession();

        const hubListener = Hub.listen('auth', ({ payload }) => {
            if (payload.event === 'signedIn') {
                setIsAuthenticated(true);
                checkSession();
            }
            if (payload.event === 'signedOut') {
                handleSignOutLocal();
            }
        });

        return () => hubListener();
    }, []);

    async function checkSession() {
        try {
            const user = await getCurrentUser();
            const session = await fetchAuthSession();

            if (!session.credentials) {
                throw new Error("No credentials in session");
            }

            setCredentials({
                accessKeyId: session.credentials.accessKeyId,
                secretAccessKey: session.credentials.secretAccessKey,
                sessionToken: session.credentials.sessionToken || "",
            });

            await loadProfile(user, session);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Session invalid", error);
            handleSignOut();
        } finally {
            setIsAuthChecking(false);
        }
    }

    async function loadProfile(user: any, session: any) {
        try {
            const attributes = await fetchUserAttributes();
            const groupsClaim = session.tokens?.accessToken?.payload['cognito:groups'];
            const groups = Array.isArray(groupsClaim) ? (groupsClaim as string[]) : [];

            setProfile({
                uuid: user.userId || user.username,
                email: attributes.email || user.username,
                firstName: attributes.given_name || 'Coordinator',
                lastName: attributes.family_name || 'User',
                groups: Array.isArray(groups) ? groups : []
            });
        } catch (e) {
            console.error("Failed to load profile attributes", e);
        }
    }

    async function handleSignOut() {
        try {
            await signOut();
            handleSignOutLocal();
        } catch (error) {
            console.error("Error signing out", error);
        }
    }

    function handleSignOutLocal() {
        setIsAuthenticated(false);
        setProfile(null);
        setCredentials(null);
    }

    if (isAuthChecking) {
        return (
            <ThemeProvider>
                <div className="flex h-screen w-full items-center justify-center bg-[hsl(var(--bg-primary))]">
                    <div className="animate-pulse text-[hsl(var(--accent))]">Initializing Grid...</div>
                </div>
            </ThemeProvider>
        );
    }

    if (!isAuthenticated) {
        return (
            <ThemeProvider>
                <LoginScreen onLoginSuccess={() => {
                    setIsAuthenticated(true);
                    checkSession();
                }} />
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider>
            <UserProvider value={{ user: profile, credentials: credentials, isAuthenticated: isAuthenticated }}>
                <BrowserRouter>
                    <Routes>
                        <Route element={<Layout signOut={handleSignOut} />}>
                            <Route path="/" element={<DashboardScreen />} />
                            <Route path="/outposts" element={<OutpostListScreen />} />
                            <Route path="/outposts/new" element={<OutpostCreationScreen />} />
                            <Route path="/outposts/:outpostUuid" element={<OutpostOverviewScreen />} />
                            <Route path="/maintenance/:outpostUuid" element={<MaintenanceScreen />} />
                            <Route path="/drones/:droneUuid" element={<DroneDetailsScreen />} />
                            <Route path="/outposts/:outpostUuid/edit" element={<OutpostEditScreen />} />
                            <Route path="/groups/:groupUuid/:outpostUuid" element={<GroupOverviewScreen />} />
                            <Route path="/missions/new/:outpostUuid" element={<MissionCreationScreen />} />
                            <Route path="/missions/:groupUuid" element={<MissionHistoryScreen />} />
                            <Route path="/detections/:groupUuid/:missionUuid" element={<DetectionReviewScreen />} />
                            <Route path="/profile" element={<CoordinatorProfileScreen profile={profile} />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </UserProvider>
        </ThemeProvider>
    );
}