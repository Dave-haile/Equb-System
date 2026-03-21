import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Scale, Gem, Calendar, Loader2 } from "lucide-react";
import type {
  ContributionModalProps,
  KaratOption,
  ContributionForm,
} from "@/types";

const KARAT_OPTIONS: KaratOption[] = [
  { value: "24", label: "24K — Pure Gold (99.9%)" },
  { value: "22", label: "22K — (91.6%)" },
  { value: "21", label: "21K — (87.5%)" },
  { value: "18", label: "18K — (75.0%)" },
];

export default function ContributionModal({
  open,
  onOpenChange,
  members,
  groupId,
  currentRound,
  onSubmit,
}: ContributionModalProps) {
  const [form, setForm] = useState<ContributionForm>({
    member_id: "",
    weight_grams: "",
    karat: "24",
    date_contributed: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const purityFactor = parseInt(form.karat) / 24;
  const pureGold = form.weight_grams
    ? (parseFloat(form.weight_grams) * purityFactor).toFixed(3)
    : "0.000";

  const handleSubmit = async () => {
    if (!form.member_id || !form.weight_grams) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...form,
        group_id: groupId,
        round_number: currentRound,
        weight_grams: parseFloat(form.weight_grams),
        karat: parseInt(form.karat),
        pure_gold_grams: parseFloat(pureGold),
        status: "pending",
      });
      setForm({
        member_id: "",
        weight_grams: "",
        karat: "24",
        date_contributed: new Date().toISOString().split("T")[0],
        notes: "",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting contribution:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gem className="w-5 h-5 text-amber-500" />
            Log Gold Contribution
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Member</Label>
            <Select
              value={form.member_id}
              onValueChange={(v) => setForm({ ...form, member_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-muted-foreground" /> Weight
                (grams)
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="5.00"
                value={form.weight_grams}
                onChange={(e) =>
                  setForm({ ...form, weight_grams: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Gem className="w-3.5 h-3.5 text-muted-foreground" /> Purity
                (Karat)
              </Label>
              <Select
                value={form.karat}
                onValueChange={(v) => setForm({ ...form, karat: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KARAT_OPTIONS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pure gold conversion */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Pure gold equivalent (24K)
              </span>
              <span className="font-bold text-amber-500">{pureGold}g</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Date
            </Label>
            <Input
              type="date"
              value={form.date_contributed}
              onChange={(e) =>
                setForm({ ...form, date_contributed: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any additional details..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.member_id || !form.weight_grams || isSubmitting}
            className="theme-brand-button font-medium"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Log Contribution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
