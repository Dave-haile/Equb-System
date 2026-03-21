import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
    LayoutDashboard, Users, Trophy, Gem,
    Menu, X, ChevronRight, Sun, Moon
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
    { name: "Members", page: "Members", icon: Users },
    { name: "Contributions", page: "Contributions", icon: Gem },
    { name: "Draw", page: "Drawing", icon: Trophy },
];

export default function Layout({ children, currentPageName }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem("goldequb-theme");
        return saved ? saved === "dark" : true;
    });

    useEffect(() => {
        localStorage.setItem("goldequb-theme", isDark ? "dark" : "light");
    }, [isDark]);

    return (
        <div className={cn("min-h-screen bg-background", isDark ? "dark" : "")}>
            <style>{`
        ${isDark ? `
          :root { color-scheme: dark; }
          body { background: hsl(200, 30%, 8%); color: hsl(45, 20%, 92%); }
        ` : `
          :root { color-scheme: light; }
          body { background: hsl(0, 0%, 98%); color: hsl(210, 40%, 10%); }
        `}
      `}</style>

            {/* Mobile header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4">
                <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-muted">
                    <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                        <Gem className="w-4 h-4 text-black" />
                    </div>
                    <span className="font-bold text-sm">GoldEqub</span>
                </div>
                <button
                    onClick={() => setIsDark(!isDark)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Toggle theme"
                >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
            </header>

            {/* Sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed top-0 left-0 bottom-0 z-50 w-64 bg-card/95 backdrop-blur-xl border-r border-border/50 transition-transform duration-300 lg:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Gem className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <h1 className="font-bold text-sm">GoldEqub</h1>
                            <p className="text-[10px] text-muted-foreground">Gold Savings System</p>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <nav className="px-3 mt-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = currentPageName === item.page;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.page}
                                to={createPageUrl(item.page)}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                                    isActive
                                        ? "bg-amber-500/10 text-amber-500 font-medium"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <Icon className="w-4.5 h-4.5" />
                                <span>{item.name}</span>
                                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Theme toggle in sidebar */}
                <div className="absolute bottom-24 left-3 right-3">
                    <button
                        onClick={() => setIsDark(!isDark)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200"
                    >
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                    </button>
                </div>

                {/* Bottom card */}
                <div className="absolute bottom-6 left-3 right-3">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-600/5 border border-amber-500/20">
                        <p className="text-xs font-medium text-amber-500">Gold Savings</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Secure, transparent, and community-driven</p>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}