import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trophy, Loader2, History } from "lucide-react";
import moment from "moment";

import WinnerWheel from "@/components/drawing/WinnerWheel";

export default function Drawing() {
  const queryClient = useQueryClient();

  const { data: groups = [] } = useQuery({
    queryKey: ["equb-groups"],
    queryFn: () => base44.entities.EqubGroup.list("-created_date"),
  });

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const activeGroupId = selectedGroupId || groups[0]?.id;
  const activeGroup = groups.find((g) => g.id === activeGroupId);

  const { data: members = [] } = useQuery({
    queryKey: ["members", activeGroupId],
    queryFn: () => base44.entities.Member.filter({ group_id: activeGroupId }),
    enabled: !!activeGroupId,
  });

  const { data: draws = [], isLoading: drawsLoading } = useQuery({
    queryKey: ["draws", activeGroupId],
    queryFn: () =>
      base44.entities.DrawResult.filter(
        { group_id: activeGroupId },
        "-round_number",
      ),
    enabled: !!activeGroupId,
  });

  const saveDraw = useMutation({
    mutationFn: (data: any) => base44.entities.DrawResult.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["draws"] }),
  });

  const updateMember = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      base44.entities.Member.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
  });

  const eligibleMembers = members.filter(
    (m) => !m.has_won && m.status === "active",
  );
  const currentRound = activeGroup?.current_round || 1;
  const totalPool = members.length * (activeGroup?.contribution_grams || 0);

  const handleWinnerSelected = async (winner: any) => {
    await saveDraw.mutateAsync({
      group_id: activeGroupId,
      round_number: currentRound,
      winner_member_id: winner.id,
      winner_name: winner.full_name,
      total_pool_grams: totalPool,
      draw_date: new Date().toISOString(),
    });
    await updateMember.mutateAsync({
      id: winner.id,
      data: { has_won: true, won_round: currentRound },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Winner Draw</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Select the winner for the current round
          </p>
        </div>
        <Select value={activeGroupId || ""} onValueChange={setSelectedGroupId}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Select group" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Round info */}
      {activeGroup && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="border bg-card/80">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Current Round</p>
              <p className="text-2xl font-bold mt-1">#{currentRound}</p>
            </CardContent>
          </Card>
          <Card className="border bg-card/80">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Pool Size</p>
              <p className="text-2xl font-bold mt-1 text-amber-500">
                {totalPool}g
              </p>
              <p className="text-[10px] text-muted-foreground">
                {activeGroup.contribution_karat}K Gold
              </p>
            </CardContent>
          </Card>
          <Card className="border bg-card/80 col-span-2 sm:col-span-1">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Eligible Members</p>
              <p className="text-2xl font-bold mt-1">
                {eligibleMembers.length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Wheel */}
      <Card className="border bg-card/80">
        <CardContent className="py-10">
          <WinnerWheel
            eligibleMembers={eligibleMembers}
            onWinnerSelected={handleWinnerSelected}
          />
        </CardContent>
      </Card>

      {/* Past draws */}
      <Card className="border bg-card/80">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <History className="w-4 h-4" /> Draw History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {drawsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : draws.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">
              No draws yet
            </p>
          ) : (
            <div className="space-y-2">
              {draws.map((draw: any) => (
                <div
                  key={draw.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Trophy className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{draw.winner_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {moment(draw.draw_date || draw.created_date).format(
                          "MMM D, YYYY",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className="bg-amber-500/10 text-amber-500 border-amber-500/20"
                    >
                      Round {draw.round_number}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {draw.total_pool_grams}g pool
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
