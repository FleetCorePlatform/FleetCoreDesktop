import { Outlet, Link, useLocation } from "react-router-dom";
import {
    User, Hexagon, Sun, Moon,
    Menu, X, LayoutDashboard, Map,
    ShieldAlert, RefreshCw, CheckCircle, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";
import { useTheme } from "@/ThemeProvider.tsx";
import { apiCall } from "@/utils/api.ts";
import {invoke} from "@tauri-apps/api/core";

interface Check {
    name: string;
    status: "UP" | "DOWN";
    data?: any;
}

interface Health {
    status: "UP" | "DOWN";
    checks: Array<Check>;
}

const getRouteIndex = (pathname: string) => {
    if (pathname === "/") return 0;

    if (pathname.startsWith("/drones/")) return 4;
    if (pathname.startsWith("/drones")) return 1;

    if (pathname.startsWith("/outposts")) {
        if (pathname === "/outposts") return 2.0;
        if (pathname === "/outposts/new") return 2.1;
        return 2.2;
    }
    if (pathname.startsWith("/groups")) return 3;

    if (pathname.startsWith("/missions")) {
        if (pathname.includes("/new")) return 5.1;
        return 5.0;
    }
    if (pathname.startsWith("/profile")) return 6;
    return 0;
};

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0,
        position: 'absolute' as const,
    }),
    center: {
        x: 0,
        opacity: 1,
        position: 'relative' as const,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? "100%" : "-100%",
        opacity: 0,
        position: 'absolute' as const,
    }),
};

const sidebarVariants = {
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
};

const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
};

interface LayoutProps {
    signOut: () => void;
}

export default function Layout({ signOut }: LayoutProps) {
    const [version, setVersion] = useState("");

    const location = useLocation();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const [health, setHealth] = useState<Health | null>(null);
    const [isHealthLoading, setIsHealthLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);



    const checkHealth = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const healthRes = await apiCall('/q/health', undefined, "GET");
            setHealth(healthRes);
        } catch (error: any) {
            if (error.status === 503 && error.data) {
                setHealth(error.data);
            } else {
                console.error("Health check critical failure", error);
                setHealth({ status: "DOWN", checks: [] });
            }
        } finally {
            setIsHealthLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        checkHealth();

        invoke<string>("get_build_version")
            .then((v) => setVersion(v || "N/A"))
            .catch((e) => {
                console.error("Error fetching build version:", e);
                setVersion("N/A");
            });
    }, [checkHealth]);

    const currentIdx = getRouteIndex(location.pathname);
    const prevIdx = useRef(currentIdx);
    const direction = currentIdx > prevIdx.current ? 1 : -1;

    useEffect(() => {
        prevIdx.current = currentIdx;
    }, [currentIdx]);

    if (!isHealthLoading && health?.status === 'DOWN') {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] p-6 relative">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-4 ring-1 ring-red-500/20">
                            <ShieldAlert className="w-10 h-10 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">System Critical</h1>
                        <p className="text-[hsl(var(--text-secondary))]">
                            Essential services are offline. Functionality is limited
                        </p>
                    </div>

                    <Card className="bg-[hsl(var(--bg-secondary))] border-red-500/30 shadow-2xl shadow-red-900/10">
                        <CardHeader className="pb-3 border-b border-[hsl(var(--border-primary))]">
                            <CardTitle className="text-sm font-mono uppercase tracking-wider text-[hsl(var(--text-secondary))]">Diagnostic Report</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-[hsl(var(--border-primary))]">
                                {health.checks && health.checks.length > 0 ? (
                                    health.checks.map((check, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-[hsl(var(--bg-tertiary))]/50 transition-colors">
                                            <span className="text-sm font-medium">{check.name}</span>
                                            {check.status === 'UP' ? (
                                                <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                                    <CheckCircle size={12} /> UP
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-red-400 text-xs font-mono font-bold px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                                                    <XCircle size={12} /> DOWN
                                                </span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-[hsl(var(--text-muted))]">
                                        No specific diagnostic data available.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <Button
                            onClick={checkHealth}
                            disabled={isRefreshing}
                            className="w-full bg-white text-black hover:bg-gray-200 h-10 font-medium"
                        >
                            {isRefreshing ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Reconnecting...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Recheck System Status
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={signOut}
                            className="w-full border-[hsl(var(--border-primary))] hover:bg-[hsl(var(--bg-tertiary))]"
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>

                <div className="absolute bottom-4 right-6 pointer-events-none select-none">
                    <p className="text-[10px] font-mono text-[hsl(var(--text-secondary))] opacity-50">
                        {version}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">

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

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={backdropVariants}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 z-[3000] lg:hidden backdrop-blur-sm"
                        />

                        <motion.div
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={sidebarVariants}
                            className="fixed top-0 left-0 bottom-0 w-[280px] bg-[hsl(var(--bg-secondary))] border-r border-[hsl(var(--border-primary))] z-[3000] lg:hidden shadow-2xl flex flex-col"
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

            <div className="fixed bottom-1 right-2 z-50 pointer-events-none select-none mix-blend-difference">
                <p className="text-[9px] font-mono text-[hsl(var(--text-secondary))] opacity-30">
                    {version}
                </p>
            </div>
        </div>
    );
}

function AnimatedTab({ to, label }: { to: string; label: string }) {
    const location = useLocation();
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