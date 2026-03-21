import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StatsCardProps } from "@/types";

export default function StatsCard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-amber-500",
  trend,
}: StatsCardProps) {
  return (
    <Card className="border bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className={cn("p-2.5 rounded-xl bg-muted/50", iconColor)}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <span
              className={cn(
                "text-xs font-medium",
                trend.isUp ? "text-emerald-500" : "text-red-500",
              )}
            >
              {trend.isUp ? "↑" : "↓"} {trend.value}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
