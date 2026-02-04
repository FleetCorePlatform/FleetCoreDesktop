import { Outlet, Link, useLocation } from "react-router-dom";
import { Bell, Settings, User, Hexagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect } from "react";

// 1. Define the logical order of your screens
const routeOrder = ["/", "/missions", "/drones", "/outposts", "/profile"];

// 2. Define Animation Variants
const slideVariants = {
    // Incoming screen: starts from Right (+100%) or Left (-100%)
    enter: (direction: number) => ({
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0,
    }),
    // Active screen: sits in the center
    center: {
        x: 0,
        opacity: 1,
    },
    // Outgoing screen: exits to Left (-100%) or Right (+100%)
    exit: (direction: number) => ({
        x: direction < 0 ? "100%" : "-100%",
        opacity: 0,
    }),
};

export default function Layout() {
    const location = useLocation();

    // 3. Calculate Direction Logic
    const currentIdx = routeOrder.indexOf(location.pathname);
    // Use a ref to store the previous index without triggering re-renders
    const prevIdx = useRef(currentIdx);

    // Determine direction: +1 (Next) or -1 (Prev)
    // If we can't find the route (e.g. 404), default to 0 (fade only)
    const direction = currentIdx > prevIdx.current ? 1 : -1;

    // Update the ref AFTER rendering so it's ready for the next change
    useEffect(() => {
        prevIdx.current = currentIdx;
    }, [currentIdx]);

    return (
        <div className="flex flex-col h-screen bg-[#0f1115] text-white font-sans overflow-hidden">

            {/* --- Global Header --- */}
            <header className="flex items-center justify-between px-4 lg:px-6 py-3 bg-[#111318] border-b border-[#282e39] z-30">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-6 h-6 text-[#135bec] flex items-center justify-center">
                            <Hexagon size={24} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-base font-bold tracking-tight">FleetCore</h2>
                    </Link>
                </div>

                <div className="flex items-center gap-4 lg:gap-8">
                    <nav className="hidden lg:flex items-center gap-6 relative">
                        <AnimatedTab to="/" label="Dashboard" />
                        <AnimatedTab to="/missions" label="Missions" />
                        <AnimatedTab to="/drones" label="Drones" />
                        <AnimatedTab to="/outposts" label="Outposts" />
                    </nav>

                    <div className="flex items-center gap-1.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#1c1f27]">
                            <Bell size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#1c1f27]">
                            <Settings size={18} />
                        </Button>
                        <Link to="/profile">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 hover:bg-[#1c1f27] transition-colors ${location.pathname === "/profile" ? "bg-[#135bec]/20 border border-[#135bec]" : ""}`}
                            >
                                <User size={18} className={location.pathname === "/profile" ? "text-[#135bec]" : ""} />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* --- Page Content with Directional Swipe --- */}
            <div className="flex-1 overflow-hidden relative bg-[#0f1115]">
                {/* mode="wait" ensures the old screen leaves before new one enters, preventing layout overlap issues */}
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={location.pathname}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="h-full w-full"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// --- Animated Tab (Unchanged) ---
function AnimatedTab({ to, label }: { to: string; label: string }) {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`relative text-sm font-medium transition-colors px-1 py-3 ${
                isActive ? "text-white" : "text-[#9da6b9] hover:text-white"
            }`}
        >
            {label}
            {isActive && (
                <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#135bec] shadow-[0_0_10px_#135bec]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}
        </Link>
    );
}