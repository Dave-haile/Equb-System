import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  UserPlus,
  Phone,
  Mail,
  Trophy,
  Loader2,
  User,
  Edit2,
  UserX,
  UserCheck,
} from "lucide-react";
import type { Member, MemberCreateData } from "@/types";
import { cn } from "@/lib/utils";
import MemberModal from "./MemberModal";
import StatusConfirmModal from "./StatusConfirmModal";
import { toast } from "sonner";

export default function Members() {
  const [search, setSearch] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [statusTargetMember, setStatusTargetMember] = useState<Member | null>(
    null,
  );

  const queryClient = useQueryClient();

  const { data: groups = [] } = useQuery({
    queryKey: ["equb-groups"],
    queryFn: () => base44.entities.EqubGroup.list("-created_date"),
  });

  const activeGroupId = selectedGroupId || groups[0]?.id;

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members", activeGroupId],
    queryFn: () => base44.entities.Member.filter({ group_id: activeGroupId }),
    enabled: !!activeGroupId,
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: MemberCreateData) => base44.entities.Member.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member added successfully");
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Member> }) =>
      base44.entities.Member.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member updated successfully");
    },
  });

  const filtered = members.filter(
    (m) =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone_number?.includes(search),
  );

  const handleSaveMember = async (data: MemberCreateData | Partial<Member>) => {
    if (editingMember) {
      await updateMemberMutation.mutateAsync({ id: editingMember.id, data });
    } else {
      if (!activeGroupId) return;
      await addMemberMutation.mutateAsync({
        ...data,
        group_id: activeGroupId,
        status: "active",
        has_won: false,
        joined_date: new Date().toISOString(),
      } as MemberCreateData);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTargetMember) return;
    const newStatus =
      statusTargetMember.status === "active" ? "inactive" : "active";
    await updateMemberMutation.mutateAsync({
      id: statusTargetMember.id,
      data: { status: newStatus },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage members in your Equb groups
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingMember(null);
            setIsMemberModalOpen(true);
          }}
          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-medium"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Add Member
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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

      {/* Member list */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-dashed">
          <CardContent className="py-16 text-center">
            <User className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No members found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m: Member) => (
            <Card
              key={m.id}
              className={cn(
                "border bg-card/80 hover:border-amber-500/20 transition-colors",
                m.status === "inactive" && "opacity-75 grayscale-[0.5]",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <User className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-bold">{m.full_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            m.status === "active"
                              ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                              : "text-red-400 border-red-400/20 bg-red-400/5",
                          )}
                        >
                          {m.status}
                        </Badge>
                        {m.has_won && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 text-amber-500 border-amber-500/20 bg-amber-500/5 gap-1"
                          >
                            <Trophy className="w-2.5 h-2.5" /> Won
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-muted hover:text-foreground"
                      onClick={() => {
                        setEditingMember(m);
                        setIsMemberModalOpen(true);
                      }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 hover:bg-muted hover:text-foreground",
                        m.status === "active"
                          ? "text-red-400"
                          : "text-emerald-400",
                      )}
                      onClick={() => {
                        setStatusTargetMember(m);
                        setIsStatusModalOpen(true);
                      }}
                    >
                      {m.status === "active" ? (
                        <UserX className="w-3.5 h-3.5" />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {m.phone_number && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" /> {m.phone_number}
                    </div>
                  )}
                  {m.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" /> {m.email}
                    </div>
                  )}
                </div>

                {m.has_won && m.won_round && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Win Details
                    </p>
                    <p className="text-xs mt-1">Won in Round #{m.won_round}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <MemberModal
        open={isMemberModalOpen}
        onOpenChange={setIsMemberModalOpen}
        member={editingMember}
        onSubmit={handleSaveMember}
      />

      {statusTargetMember && (
        <StatusConfirmModal
          open={isStatusModalOpen}
          onOpenChange={setIsStatusModalOpen}
          onConfirm={handleToggleStatus}
          currentStatus={statusTargetMember.status || "active"}
          memberName={statusTargetMember.full_name}
        />
      )}
    </div>
  );
}
