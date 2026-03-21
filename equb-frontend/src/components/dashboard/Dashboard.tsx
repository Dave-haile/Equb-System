import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gem, Users, Trophy, Clock, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type {
  Contribution,
  EqubGroup,
  Member,
  DrawResult,
  ContributionCreateData,
} from "@/types";
import EqubCard from "@/components/shared/EqubCard";
import StatsCard from "@/components/shared/StatsCard";
import GoldPriceTracker from "@/components/shared/GoldPriceTracker";
import CountdownTimer from "@/components/shared/CountdownTimer";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ContributionModal from "@/components/Contribution/ContributionModal";

import api from "@/api/api";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const [selectedGroup, setSelectedGroup] = useState<EqubGroup | null>(null);
  const [showContribution, setShowContribution] = useState<boolean>(false);
  const [fallbackNextDraw] = useState<string>(() =>
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  );
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const { data: groups = [] } = useQuery<EqubGroup[]>({
    queryKey: ["equb-groups"],
    queryFn: async () => {
      const res = await api.get("/api/dashboard/groups", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
    enabled: !!token,
    staleTime: 60_000,
  });

  const activeGroup = selectedGroup || groups[0];

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["members", activeGroup?.id],
    queryFn: async () => {
      const res = await api.get(
        `/api/dashboard/groups/${activeGroup!.id}/members`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      return res.data;
    },
    enabled: !!activeGroup?.id && !!token,
    staleTime: 30_000,
  });

  const { data: contributions = [] } = useQuery<Contribution[]>({
    queryKey: ["contributions", activeGroup?.id],
    queryFn: async () => {
      const res = await api.get(
        `/api/dashboard/groups/${activeGroup!.id}/contributions?limit=20`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      return res.data;
    },
    enabled: !!activeGroup?.id && !!token,
    staleTime: 10_000,
  });

  const { data: draws = [] } = useQuery<DrawResult[]>({
    queryKey: ["draws", activeGroup?.id],
    queryFn: async () => {
      const res = await api.get(`/api/dashboard/groups/${activeGroup!.id}/draws?limit=5`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
    enabled: !!activeGroup?.id && !!token,
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: (data: ContributionCreateData) =>
      api
        .post("/api/dashboard/contributions", data, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contributions", activeGroup?.id],
      });
    },
  });

  const currentRound: number = activeGroup?.current_round || 1;
  const totalPool: number =
    members.length * (activeGroup?.contribution_grams || 0);
  const paidCount: number = contributions.filter(
    (c: Contribution) =>
      c.round_number === currentRound && c.status === "verified",
  ).length;

  const handleContribution = async (data: ContributionCreateData) => {
    await mutation.mutateAsync(data);
  };

  const nextDraw: string = useMemo(
    () =>
      activeGroup?.next_draw_date || fallbackNextDraw,
    [activeGroup?.next_draw_date, fallbackNextDraw],
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your gold-based Equb groups and contributions
          </p>
        </div>
        <Button
          onClick={() => setShowContribution(true)}
          className="bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" /> Log Contribution
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Active Groups"
          value={groups.filter((g) => g.status === "active").length}
          subtitle={activeGroup?.name || "No active group"}
          icon={Gem}
          iconColor="text-amber-500"
        />
        <StatsCard
          label="Current Round"
          value={`#${currentRound}`}
          subtitle={activeGroup?.name || "—"}
          icon={Clock}
          iconColor="text-emerald-500"
        />
        <StatsCard
          label="Pool Size"
          value={`${totalPool}g`}
          subtitle={`${activeGroup?.contribution_karat || 24}K gold`}
          icon={Trophy}
          iconColor="text-amber-500"
        />
        <StatsCard
          label="Members Paid"
          value={`${paidCount}/${members.length}`}
          subtitle="This round"
          icon={Users}
          iconColor="text-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Countdown + Gold Tracker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Next Draw Countdown
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pb-6">
                <CountdownTimer targetDate={nextDraw} />
                <Link
                  to="/draw"
                  className="mt-6 text-xs text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1 transition-colors group"
                >
                  Go to live drawing{" "}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </CardContent>
            </Card>
            <GoldPriceTracker
              poolGrams={totalPool}
              karat={activeGroup?.contribution_karat || 24}
            />
          </div>

          {/* Equb Groups Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Your Equb Groups
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-amber-500"
                asChild
              >
                <Link to="/groups">View All</Link>
              </Button>
            </div>
            {groups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groups.map((group: EqubGroup) => (
                  <EqubCard
                    key={group.id}
                    group={group}
                    onClick={setSelectedGroup}
                    isSelected={activeGroup?.id === group.id}
                  />
                ))}
              </div>
            ) : (
              <Card className="border border-dashed bg-muted/30">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gem className="w-8 h-8 text-muted-foreground opacity-40" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    No Equb groups yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                    Create your first gold-based Equb group to start saving with
                    others.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-6 border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                  >
                    Create Group
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right column — Activity */}
        <div className="space-y-6">
          <Card className="border bg-card/80 backdrop-blur-sm sticky top-8">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-4">
              <RecentActivity contributions={contributions} draws={draws} />
            </CardContent>
          </Card>
        </div>
      </div>

      {activeGroup && (
        <ContributionModal
          open={showContribution}
          onOpenChange={setShowContribution}
          members={members}
          groupId={activeGroup.id}
          currentRound={currentRound}
          onSubmit={handleContribution}
        />
      )}
    </div>
  );
}
