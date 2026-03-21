import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Coins,
  Trophy,
  UserPlus,
  Play,
  Gem,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Shield,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Groups", icon: Users, path: "/groups" },
  { label: "Contributions", icon: Coins, path: "/contributions" },
  { label: "Winner Draw", icon: Trophy, path: "/drawing" },
  { label: "Members", icon: UserPlus, path: "/members" },
  { label: "Live Draw", icon: Play, path: "/draw" },
  { label: "User Management", icon: Shield, path: "/users", adminOnly: true },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar({
  onNavClick,
  forceExpand = false,
}: {
  onNavClick?: () => void;
  forceExpand?: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  const [collapsed, setCollapsed] = useState(false);

  const isDark = resolvedTheme !== "light";
  const isActuallyCollapsed = forceExpand ? false : collapsed;

  const filteredNavItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        if (item.adminOnly) return user?.role === "Admin";
        return true;
      }),
    [user?.role],
  );

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleThemeToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <aside
      className={cn(
        "theme-sidebar-glass theme-transition sticky top-0 z-50 flex h-screen flex-col overflow-hidden overscroll-contain border-r",
        isActuallyCollapsed ? "w-20" : "w-64",
      )}
      onWheelCapture={(e) => e.preventDefault()}
      onTouchMoveCapture={(e) => e.preventDefault()}
    >
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/20">
            <Gem className="h-4 w-4 text-black" />
          </div>
          {!isActuallyCollapsed && (
            <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
              GoldEqub
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-hidden px-3 py-6">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavClick}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                isActive
                  ? "bg-amber-500/12 text-amber-500"
                  : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
              title={isActuallyCollapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive
                    ? "text-amber-500"
                    : "text-sidebar-foreground/65 group-hover:text-sidebar-foreground",
                )}
              />

              {!isActuallyCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}

              {isActive && (
                <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-amber-500" />
              )}

              {isActuallyCollapsed && (
                <div className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-10 w-full gap-3 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            isActuallyCollapsed ? "justify-center" : "justify-start",
          )}
          onClick={handleThemeToggle}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Light mode" : "Dark mode"}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {!isActuallyCollapsed && (
            <span className="text-sm">
              {isDark ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-10 w-full gap-3 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            isActuallyCollapsed ? "justify-center" : "justify-start",
          )}
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {isActuallyCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
          {!isActuallyCollapsed && <span className="text-sm">Collapse</span>}
        </Button>

        <div
          className={cn(
            "rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-2",
            isActuallyCollapsed
              ? "flex items-center justify-center"
              : "flex items-center gap-3 px-3",
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/15 text-xs font-bold uppercase text-amber-500">
            {user?.name?.substring(0, 2) || "U"}
          </div>

          {!isActuallyCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-sidebar-foreground">
                  {user?.name || "User"}
                </p>
                <p className="truncate text-[10px] capitalize text-muted-foreground">
                  {user?.role || "Member"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md p-1 text-sidebar-foreground/45 transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}

          {isActuallyCollapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/45 transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
