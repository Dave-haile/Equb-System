import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import type { EqubGroup, CreateGroupModalProps } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CreateGroupModal({
  isOpen,
  onClose,
}: CreateGroupModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    contribution_grams: 1,
    contribution_karat: 21,
    total_rounds: 10,
    interval_days: 30,
  });

  const createMutation = useMutation({
    mutationFn: (newGroup: Partial<EqubGroup>) => {
      return base44.entities.EqubGroup.create({
        ...newGroup,
        status: "active",
        current_round: 1,
        created_date: new Date().toISOString(),
      } as EqubGroup);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equb-groups"] });
      toast.success("Group created successfully!");
      onClose();
      setFormData({
        name: "",
        contribution_grams: 1,
        contribution_karat: 21,
        total_rounds: 10,
        interval_days: 30,
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to create group: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    createMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-border bg-card text-card-foreground theme-transition">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-amber-500">
            Create New Equb Group
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground/80">
              Group Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Golden Circle 2024"
              className="bg-background/70 focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grams" className="text-foreground/80">
                Contribution (Grams)
              </Label>
              <Input
                id="grams"
                type="number"
                step="0.01"
                value={formData.contribution_grams}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contribution_grams: parseFloat(e.target.value),
                  })
                }
                className="bg-background/70 focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="karat" className="text-foreground/80">
                Karat
              </Label>
              <Input
                id="karat"
                type="number"
                value={formData.contribution_karat}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contribution_karat: parseInt(e.target.value),
                  })
                }
                className="bg-background/70 focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rounds" className="text-foreground/80">
                Total Rounds
              </Label>
              <Input
                id="rounds"
                type="number"
                value={formData.total_rounds}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    total_rounds: parseInt(e.target.value),
                  })
                }
                className="bg-background/70 focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interval" className="text-foreground/80">
                Interval (Days)
              </Label>
              <Input
                id="interval"
                type="number"
                value={formData.interval_days}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interval_days: parseInt(e.target.value),
                  })
                }
                className="bg-background/70 focus:border-amber-500/50"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 font-bold text-black hover:from-amber-400 hover:to-yellow-400"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
