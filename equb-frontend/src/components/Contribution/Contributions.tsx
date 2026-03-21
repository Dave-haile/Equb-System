import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Contribution,
  ContributionCreateData,
  ContributionUpdateData,
  EqubGroup,
  Member,
} from "@/types";
import {
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Gem,
  Scale,
  Loader2,
} from "lucide-react";
import ContributionModal from "@/components/Contribution/ContributionModal";
import { cn } from "@/lib/utils";
import moment from "moment";

const statusConfig: Record<
  Contribution["status"],
  { icon: typeof CheckCircle; label: string; class: string }
> = {
  verified: {
    icon: CheckCircle,
    label: "Verified",
    class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    class: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    class: "bg-red-500/10 text-red-500 border-red-500/20",
  },
};

export default function Contributions() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: groups = [] } = useQuery<EqubGroup[]>({
    queryKey: ["equb-groups"],
    queryFn: () => base44.entities.EqubGroup.list("-created_date"),
  });

  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const activeGroupId = selectedGroupId || groups[0]?.id;
  const activeGroup = groups.find((g: EqubGroup) => g.id === activeGroupId);

  const { data: contributions = [], isLoading } = useQuery<Contribution[]>({
    queryKey: ["contributions", activeGroupId],
    queryFn: () =>
      base44.entities.Contribution.filter(
        { group_id: activeGroupId },
        "-created_date",
        50,
      ),
    enabled: !!activeGroupId,
  });

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["members", activeGroupId],
    queryFn: () => base44.entities.Member.filter({ group_id: activeGroupId }),
    enabled: !!activeGroupId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: ContributionUpdateData) =>
      base44.entities.Contribution.update(id, { status }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["contributions"] }),
  });

  const handleSubmit = async (data: ContributionCreateData) => {
    await base44.entities.Contribution.create(data);
    queryClient.invalidateQueries({ queryKey: ["contributions"] });
  };

  const getMemberName = (memberId: string): string => {
    const m = members.find((m: Member) => m.id === memberId);
    return m?.full_name || "Unknown";
  };

  const filtered: Contribution[] =
    filterStatus === "all"
      ? contributions
      : contributions.filter((c) => c.status === filterStatus);

  const totalPureGold: number = contributions
    .filter((c: Contribution) => c.status === "verified")
    .reduce((sum, c) => sum + (c.pure_gold_grams || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contributions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and verify gold contributions
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="theme-brand-button font-medium"
        >
          <Plus className="w-4 h-4 mr-2" /> New Contribution
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="border bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Scale className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Pure Gold</p>
              <p className="text-lg font-bold">{totalPureGold.toFixed(2)}g</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Verified</p>
              <p className="text-lg font-bold">
                {contributions.filter((c) => c.status === "verified").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border bg-card/80 col-span-2 sm:col-span-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold">
                {contributions.filter((c) => c.status === "pending").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={activeGroupId || ""} onValueChange={setSelectedGroupId}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Select group" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((g: EqubGroup) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contribution list */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-dashed">
          <CardContent className="py-16 text-center">
            <Gem className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">
              No contributions found
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c: Contribution) => {
            const config = statusConfig[c.status] || statusConfig.pending;
            const Icon = config.icon;
            return (
              <Card key={c.id} className="border bg-card/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
                        <Gem className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getMemberName(c.member_id)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Round {c.round_number} ·{" "}
                          {moment(c.date_contributed || c.created_date).format(
                            "MMM D, YYYY",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold">{c.weight_grams}g</p>
                        <p className="text-[10px] text-muted-foreground">
                          {c.karat}K · {c.pure_gold_grams?.toFixed(3) || "—"}g
                          pure
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("text-xs gap-1", config.class)}
                      >
                        <Icon className="w-3 h-3" /> {config.label}
                      </Badge>
                    </div>
                  </div>
                  {c.status === "pending" && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10 text-xs"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: c.id,
                            status: "verified",
                          })
                        }
                      >
                        <CheckCircle className="w-3 h-3 mr-1" /> Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 border-red-500/20 hover:bg-red-500/10 text-xs"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: c.id,
                            status: "rejected",
                          })
                        }
                      >
                        <XCircle className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeGroup && (
        <ContributionModal
          open={showModal}
          onOpenChange={setShowModal}
          members={members}
          groupId={activeGroupId}
          currentRound={activeGroup.current_round || 1}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
