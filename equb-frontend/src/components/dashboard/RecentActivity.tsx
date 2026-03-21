import { CheckCircle, Trophy, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import moment from "moment";
import type {
  RecentActivityProps,
  Activity,
  ActivityIconConfig,
} from "@/types";

const activityIcons: Record<string, ActivityIconConfig> = {
  contribution: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  winner: { icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
  new_member: { icon: Plus, color: "text-blue-500", bg: "bg-blue-500/10" },
  pending: { icon: Clock, color: "text-slate-400", bg: "bg-slate-500/10" },
};

export default function RecentActivity({
  contributions = [],
  draws = [],
}: RecentActivityProps) {
  const activities: Activity[] = [
    ...contributions.slice(0, 5).map((c) => ({
      type: c.status === "verified" ? "contribution" : "pending",
      text: `${c.weight_grams}g (${c.karat}K) contributed`,
      date: c.created_date,
      id: `c-${c.id}`,
    })),
    ...draws.slice(0, 3).map((d) => ({
      type: "winner",
      text: `${d.winner_name} won Round ${d.round_number}`,
      date: d.created_date,
      id: `d-${d.id}`,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-6 h-6 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity) => {
        const config = activityIcons[activity.type];
        const Icon = config.icon;
        return (
          <div
            key={activity.id}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className={cn("p-1.5 rounded-lg", config.bg)}>
              <Icon className={cn("w-3.5 h-3.5", config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{activity.text}</p>
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {moment(activity.date).fromNow()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
