import "./App.css"

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

import DashboardScreen from "./screens/DashboardScreen";
import MissionPlanningScreen from "./screens/MissionScreen";
import FleetScreen from "./screens/DronesScreen";
import OutpostCreationScreen from "./screens/OutpostCreationScreen";
import CoordinatorProfileScreen from "./screens/ProfileScreen";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Wrap all authenticated routes in the Layout */}
                <Route element={<Layout />}>
                    <Route path="/" element={<DashboardScreen />} />
                    <Route path="/missions" element={<MissionPlanningScreen />} />
                    <Route path="/drones" element={<FleetScreen />} />
                    <Route path="/outposts" element={<OutpostCreationScreen />} />
                    <Route path="/profile" element={<CoordinatorProfileScreen />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}