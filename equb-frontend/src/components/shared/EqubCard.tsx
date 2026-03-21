import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EqubCardProps } from "@/types";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  completed: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  paused: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function EqubCard({
  group,
  onClick,
  isSelected,
}: EqubCardProps) {
  const progress =
    group.total_rounds > 0
      ? ((group.current_round || 1) / group.total_rounds) * 100
      : 0;

  return (
    <Card
      onClick={() => onClick?.(group)}
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 border overflow-hidden group",
        "bg-gradient-to-br from-card to-card/80",
        isSelected && "ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10",
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-base text-foreground group-hover:text-amber-500 transition-colors">
              {group.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {group.contribution_grams}g · {group.contribution_karat}K per
              round
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn("text-xs capitalize", statusStyles[group.status])}
          >
            {group.status}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <Users className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-1" />
            <p className="text-sm font-medium">{group.members_count || 0}</p>
            <p className="text-[10px] text-muted-foreground">Members</p>
          </div>
          <div className="text-center">
            <Trophy className="w-3.5 h-3.5 mx-auto text-amber-500 mb-1" />
            <p className="text-sm font-medium">{group.current_round || 1}</p>
            <p className="text-[10px] text-muted-foreground">Round</p>
          </div>
          <div className="text-center">
            <Clock className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-1" />
            <p className="text-sm font-medium">{group.interval_days || 30}d</p>
            <p className="text-[10px] text-muted-foreground">Interval</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
            <span>Progress</span>
            <span>
              {group.current_round || 1}/{group.total_rounds}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-end mt-3 text-xs text-muted-foreground group-hover:text-amber-500 transition-colors">
          <span>View details</span>
          <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </CardContent>
    </Card>
  );
}
