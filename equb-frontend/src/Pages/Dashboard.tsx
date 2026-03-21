import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gem, Users, Trophy, Clock, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
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

export default function Dashboard() {
  const [selectedGroup, setSelectedGroup] = useState<EqubGroup | null>(null);
  const [showContribution, setShowContribution] = useState<boolean>(false);

  const { data: groups = [] } = useQuery<EqubGroup[]>({
    queryKey: ["equb-groups"],
    queryFn: () => base44.entities.EqubGroup.list("-created_date"),
  });

  const activeGroup = selectedGroup || groups[0];

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["members", activeGroup?.id],
    queryFn: () => base44.entities.Member.filter({ group_id: activeGroup.id }),
    enabled: !!activeGroup?.id,
  });

  const { data: contributions = [] } = useQuery<Contribution[]>({
    queryKey: ["contributions", activeGroup?.id],
    queryFn: () =>
      base44.entities.Contribution.filter(
        { group_id: activeGroup.id },
        "-created_date",
        20,
      ),
    enabled: !!activeGroup?.id,
  });

  const { data: draws = [] } = useQuery<DrawResult[]>({
    queryKey: ["draws", activeGroup?.id],
    queryFn: () =>
      base44.entities.DrawResult.filter(
        { group_id: activeGroup.id },
        "-created_date",
        5,
      ),
    enabled: !!activeGroup?.id,
  });

  const currentRound: number = activeGroup?.current_round || 1;
  const totalPool: number =
    members.length * (activeGroup?.contribution_grams || 0);
  const paidCount: number = contributions.filter(
    (c: Contribution) =>
      c.round_number === currentRound && c.status === "verified",
  ).length;

  const handleContribution = async (data: ContributionCreateData) => {
    await base44.entities.Contribution.create(data);
  };

  // Default next draw date: 7 days from now
  const nextDraw: string = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/purity
      activeGroup?.next_draw_date ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    [activeGroup?.next_draw_date],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your gold-based Equb groups
          </p>
        </div>
        <Button
          onClick={() => setShowContribution(true)}
          className="theme-brand-button font-medium"
        >
          <Plus className="w-4 h-4 mr-2" /> Log Contribution
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          label="Active Groups"
          value={groups.filter((g) => g.status === "active").length}
          subtitle={activeGroup?.name || "—"}
          icon={Gem}
          iconColor="text-amber-500"
          trend=""
        />
        <StatsCard
          label="Current Round"
          value={`#${currentRound}`}
          subtitle={activeGroup?.name || "—"}
          icon={Clock}
          iconColor="text-emerald-500"
          trend=""
        />
        <StatsCard
          label="Pool Size"
          value={`${totalPool}g`}
          subtitle={`${activeGroup?.contribution_karat || 24}K gold`}
          icon={Trophy}
          iconColor="text-amber-500"
          trend=""
        />
        <StatsCard
          label="Members Paid"
          value={`${paidCount}/${members.length}`}
          subtitle="This round"
          icon={Users}
          iconColor="text-blue-500"
          trend=""
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Countdown + Gold Tracker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Next Draw
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pb-5">
                <CountdownTimer targetDate={nextDraw} />
                <Link
                  to={createPageUrl("Drawing")}
                  className="mt-4 text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
                >
                  Go to draw <ArrowRight className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>
            <GoldPriceTracker
              poolGrams={totalPool}
              karat={activeGroup?.contribution_karat || 24}
            />
          </div>

          {/* Equb Groups */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Your Groups
              </h2>
            </div>
            {groups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <Card className="border border-dashed">
                <CardContent className="py-12 text-center">
                  <Gem className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <p className="text-sm text-muted-foreground">
                    No Equb groups yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create your first gold-based Equb group to get started
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right column — Activity */}
        <div>
          <Card className="border bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              <RecentActivity
                contributions={contributions as never[]}
                draws={draws as never[]}
              />
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
