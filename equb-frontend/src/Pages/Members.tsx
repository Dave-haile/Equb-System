import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserPlus, Search, Loader2 } from "lucide-react";
import MemberTable from "@/components/members/Members";
import "@/components/UserNotRegisteredError";

export default function Members() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [newMember, setNewMember] = useState({ full_name: "", phone: "" });
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

  const { data: contributions = [] } = useQuery({
    queryKey: ["contributions", activeGroupId],
    queryFn: () =>
      base44.entities.Contribution.filter({ group_id: activeGroupId }),
    enabled: !!activeGroupId,
  });

  const activeGroup = groups.find((g) => g.id === activeGroupId);
  const currentRound = activeGroup?.current_round || 1;

  const addMemberMutation = useMutation({
    mutationFn: (data) => base44.entities.Member.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setShowAdd(false);
      setNewMember({ full_name: "", phone: "" });
    },
  });

  const filteredMembers = members.filter((m) =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your group members
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(true)}
          className="theme-brand-button font-medium"
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
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

      <Card className="border bg-card/80">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <MemberTable
              members={filteredMembers}
              contributions={contributions}
              currentRound={currentRound}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="Enter full name"
                value={newMember.full_name}
                onChange={(e) =>
                  setNewMember({ ...newMember, full_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                placeholder="Phone number"
                value={newMember.phone}
                onChange={(e) =>
                  setNewMember({ ...newMember, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Group</Label>
              <Select
                value={activeGroupId || ""}
                onValueChange={setSelectedGroupId}
              >
                <SelectTrigger>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                addMemberMutation.mutate({
                  ...newMember,
                  group_id: activeGroupId,
                  hand_number: members.length + 1,
                })
              }
              disabled={
                !newMember.full_name ||
                !activeGroupId ||
                addMemberMutation.isPending
              }
              className="theme-brand-button"
            >
              {addMemberMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
