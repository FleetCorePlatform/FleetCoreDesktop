import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Map, Plane, Building2 } from "lucide-react";

const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "missions", label: "Missions", icon: Map },
    { id: "drones", label: "Drones", icon: Plane },
    { id: "outposts", label: "Outposts", icon: Building2 },
];

export default function TabControl() {
    const [activeTab, setActiveTab] = useState("dashboard");

    return (
        <div className="flex flex-col h-screen bg-[#0f1115] text-white">
            {/* Tab Navigation */}
            <div className="relative flex items-center gap-1 px-6 py-3 bg-[#111318] border-b border-[#282e39]">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                relative px-4 py-2 rounded-lg text-sm font-medium transition-colors z-10
                ${isActive ? "text-white" : "text-[#9da6b9] hover:text-white"}
              `}
                        >
                            <div className="flex items-center gap-2">
                                <Icon size={16} />
                                {tab.label}
                            </div>
                        </button>
                    );
                })}

                {/* Animated Background */}
                <motion.div
                    layoutId="tabHighlight"
                    className="absolute bg-[#135bec]/20 border border-[#135bec] rounded-lg"
                    style={{
                        left: tabs.findIndex(t => t.id === activeTab) * 144 + 24,
                        width: 120,
                        height: 36,
                        top: 12
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30
                    }}
                />
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6">
                Content for {activeTab}
            </div>
        </div>
    );
}