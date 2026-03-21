import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import type { EqubGroup } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Gem, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import EqubCard from "@/components/shared/EqubCard";
import CreateGroupModal from "./CreateGroupModal";

export default function GroupsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: groups = [], isLoading } = useQuery<EqubGroup[]>({
    queryKey: ["equb-groups"],
    queryFn: () => base44.entities.EqubGroup.list("-created_date"),
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gold">
              Equb Groups
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your gold-saving circles
            </p>
          </div>
        </div>
        <Button
          className="bg-gold-gradient text-black font-bold"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Create New Group
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <EqubCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <Card className="border border-dashed bg-muted/30">
          <CardContent className="py-20 text-center">
            <Gem className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-medium">No groups found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start by creating your first gold Equb group.
            </p>
            <Button
              className="mt-6 bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Group
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
