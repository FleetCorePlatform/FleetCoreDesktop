import { Outlet, Link, useLocation } from "react-router-dom";
import {
    User, Hexagon, Sun, Moon,
    Menu, X, LayoutDashboard, Map
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useTheme } from "@/ThemeProvider.tsx";

const getRouteIndex = (pathname: string) => {
    if (pathname === "/") return 0;

    // 1. Drones (Fleet) - Left side feature
    if (pathname.startsWith("/drones")) return 1;

    // 2. Outpost Cluster
    if (pathname.startsWith("/outposts")) {
        // List View
        if (pathname === "/outposts") return 2.0;
        // Creation
        if (pathname === "/outposts/new") return 2.1;
        // Detail (e.g. /outposts/123)
        return 2.2;
    }

    // 3. Groups (Accessed FROM Outposts, so Right of Outposts)
    if (pathname.startsWith("/groups")) return 3;

    // 4. Missions (Accessed FROM Groups, so Right of Groups)
    if (pathname.startsWith("/missions")) {
        // Create New Mission (Deepest level)
        if (pathname.includes("/new")) return 4.1;
        // Mission List
        return 4.0;
    }

    // 5. Profile (Always last)
    if (pathname.startsWith("/profile")) return 5;

    return 0;
};

// 2. Page Animation Variants
const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0,
        // Add absolute position to prevent layout jumping during exit/enter overlap
        position: 'absolute',
    }),
    center: {
        x: 0,
        opacity: 1,
        position: 'relative',
    },
    exit: (direction: number) => ({
        x: direction < 0 ? "100%" : "-100%",
        opacity: 0,
        position: 'absolute',
    }),
};

// 3. Sidebar Variants (Unchanged)
const sidebarVariants = {
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
};

const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
};

export default function Layout() {
    const location = useLocation();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    // 4. Calculate Direction Logic
    const currentIdx = getRouteIndex(location.pathname);
    const prevIdx = useRef(currentIdx);

    // Determine direction
    const direction = currentIdx > prevIdx.current ? 1 : -1;

    useEffect(() => {
        prevIdx.current = currentIdx;
    }, [currentIdx]);

    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex flex-col h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">

            {/* --- Global Header --- */}
            <header className="flex items-center justify-between px-4 lg:px-6 py-3 bg-[hsl(var(--bg-secondary))] border-b border-[hsl(var(--border-primary))] z-30 relative">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden mr-2 -ml-2"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu size={20} />
                    </Button>

                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-6 h-6 text-[hsl(var(--accent))] flex items-center justify-center">
                            <Hexagon size={24} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-base font-bold tracking-tight">FleetCore</h2>
                    </Link>
                </div>

                <div className="flex items-center gap-4 lg:gap-8">
                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-6 relative">
                        <AnimatedTab to="/" label="Dashboard" />
                        <AnimatedTab to="/outposts" label="Outposts" />
                    </nav>

                    <div className="flex items-center gap-1.5">
                        <Link to="/profile">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 hover:bg-[hsl(var(--bg-tertiary))] transition-colors ${location.pathname === "/profile" ? "bg-[hsl(var(--accent))]/20 border border-[hsl(var(--accent))]" : ""}`}
                            >
                                <User size={18} className={location.pathname === "/profile" ? "text-[hsl(var(--accent))]" : ""} />
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="h-9 w-9"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </Button>
                    </div>
                </div>
            </header>

            {/* --- Mobile Sidebar Drawer --- */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={backdropVariants}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 z-[40] lg:hidden backdrop-blur-sm"
                        />

                        <motion.div
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={sidebarVariants}
                            className="fixed top-0 left-0 bottom-0 w-[280px] bg-[hsl(var(--bg-secondary))] border-r border-[hsl(var(--border-primary))] z-[50] lg:hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-4 flex items-center justify-between border-b border-[hsl(var(--border-primary))]">
                                <div className="flex items-center gap-2">
                                    <Hexagon size={20} className="text-[hsl(var(--accent))]" />
                                    <span className="font-bold">Menu</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                                    <X size={20} />
                                </Button>
                            </div>

                            <nav className="flex flex-col p-4 gap-2">
                                <MobileLink
                                    to="/"
                                    icon={<LayoutDashboard size={18} />}
                                    label="Dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                />
                                <MobileLink
                                    to="/outposts"
                                    icon={<Map size={18} />}
                                    label="Outposts"
                                    onClick={() => setMobileMenuOpen(false)}
                                />
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* --- Page Content --- */}
            <div className="flex-1 overflow-hidden relative bg-[hsl(var(--bg-primary))]">
                <AnimatePresence mode="popLayout" custom={direction}>
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
                        className="h-full w-full bg-[hsl(var(--bg-primary))]"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// --- Helper Components ---

function AnimatedTab({ to, label }: { to: string; label: string }) {
    const location = useLocation();

    // Active state logic
    const isActive = to === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(to);

    return (
        <Link
            to={to}
            className={`relative text-sm font-medium transition-colors px-1 py-3 ${
                isActive ? "text-[hsl(var(--text-primary))]" : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
            }`}
        >
            {label}
            {isActive && (
                <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--accent))] shadow-[0_0_10px_hsl(var(--accent))]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}
        </Link>
    );
}

function MobileLink({ to, icon, label, onClick }: { to: string; icon: React.ReactNode; label: string, onClick: () => void }) {
    const location = useLocation();
    const isActive = to === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(to);

    return (
        <Link to={to} onClick={onClick}>
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                isActive
                    ? "bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
                    : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))]"
            }`}>
                {icon}
                <span className="text-sm font-medium">{label}</span>
            </div>
        </Link>
    );
}