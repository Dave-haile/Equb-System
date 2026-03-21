import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import type { StatusConfirmModalProps } from "@/types";

export default function StatusConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  currentStatus,
  memberName,
}: StatusConfirmModalProps) {
  const isDeactivating = currentStatus === "active";
  const actionText = isDeactivating ? "Deactivate" : "Activate";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] border-border bg-card text-card-foreground theme-transition">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <DialogTitle className="text-center text-foreground">
            {actionText} Member?
          </DialogTitle>
          <DialogDescription className="pt-2 text-center text-muted-foreground">
            Are you sure you want to {actionText.toLowerCase()}{" "}
            <strong className="text-foreground">{memberName}</strong>?
            {isDeactivating
              ? " They will not be included in future draws until reactivated."
              : " They will be eligible for future draws."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-3 pt-6 sm:justify-center">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={
              isDeactivating
                ? "flex-1 bg-red-500 font-bold text-white hover:bg-red-600"
                : "flex-1 bg-emerald-500 font-bold text-white hover:bg-emerald-600"
            }
          >
            Confirm {actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
