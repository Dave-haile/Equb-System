import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import type { MainLayoutProps } from "@/types";

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLanding = location.pathname === "/";
  const isLogin = location.pathname === "/login";
  const isDark = resolvedTheme !== "light";

  if (isLanding || isLogin) {
    return <>{children}</>;
  }

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground theme-transition">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-60 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-70 w-64 transform transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar
          onNavClick={() => setIsMobileMenuOpen(false)}
          forceExpand={true}
        />
      </div>

      <main className="flex min-h-screen flex-1 flex-col min-w-0 overflow-hidden bg-background">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/20">
              <span className="text-xs font-bold text-black">GE</span>
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground">
              GoldEqub
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-muted-foreground hover:text-foreground"
              aria-label={isMobileMenuOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
