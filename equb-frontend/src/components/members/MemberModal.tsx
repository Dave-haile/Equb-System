import React, { useEffect, useState } from "react";
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
import type { Member, MemberModalProps } from "@/types";

export default function MemberModal({
  open,
  onOpenChange,
  member,
  onSubmit,
}: MemberModalProps) {
  const [formData, setFormData] = useState<Partial<Member>>({
    full_name: "",
    phone_number: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        full_name: member.full_name,
        phone_number: member.phone_number || "",
        email: member.email || "",
      });
      return;
    }

    setFormData({
      full_name: "",
      phone_number: "",
      email: "",
    });
  }, [member, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving member:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-border bg-card text-card-foreground theme-transition">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {member ? "Edit Member" : "Add New Member"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-foreground/80">
              Full Name
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              placeholder="Enter full name"
              required
              className="bg-background/70"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number" className="text-foreground/80">
              Phone Number
            </Label>
            <Input
              id="phone_number"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              placeholder="Enter phone number"
              className="bg-background/70"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground/80">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter email address"
              className="bg-background/70"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-500 text-black font-bold hover:bg-amber-400"
            >
              {isSubmitting
                ? "Saving..."
                : member
                  ? "Save Changes"
                  : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
