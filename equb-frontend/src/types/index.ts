import type { LucideIcon } from "lucide-react";
import React from "react";

export type Role = "Admin" | "Member";
export interface User {
  id: string;
  name: string;
  phone: string;
  role: Role;
  created_at: string;
}

export interface Contribution {
  id: string;
  member_id: string;
  group_id: string;
  weight_grams: number;
  karat: number;
  pure_gold_grams?: number;
  status: "verified" | "pending" | "rejected";
  date_contributed?: string;
  created_date: string;
  round_number: number;
}

export interface EqubGroup {
  id: string;
  name: string;
  status: "active" | "completed" | "paused";
  current_round: number;
  total_rounds: number;
  contribution_grams: number;
  contribution_karat: number;
  next_draw_date?: string;
  created_date: string;
  members_count?: number;
  interval_days?: number;
}

export interface Member {
  id: string;
  full_name: string;
  group_id: string;
  has_won?: boolean;
  status?: string;
  won_round?: number;
  phone_number?: string;
  email?: string;
  joined_date?: string;
}

export interface DrawResult {
  id: string;
  group_id: string;
  round_number: number;
  winner_member_id: string;
  winner_name: string;
  total_pool_grams: number;
  draw_date?: string;
  created_date: string;
}

export type ContributionCreateData = Omit<Contribution, "id" | "created_date">;

export type MemberCreateData = Omit<Member, "id">;

export interface ContributionUpdateData {
  id: string;
  status: "verified" | "pending" | "rejected";
}

// Component Props
export interface EqubCardProps {
  group: EqubGroup;
  onClick?: (group: EqubGroup) => void;
  isSelected?: boolean;
  key?: string | number;
}

export interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    isUp: boolean;
    value: string;
    label: string;
  };
}

export interface MainLayoutProps {
  children: React.ReactNode;
}

export interface PriceData {
  date: string;
  price: number;
}

export interface GoldPriceTrackerProps {
  poolGrams?: number;
  karat?: number;
}

export interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface Activity {
  type: string;
  text: string;
  date: string;
  id: string;
}

export interface ActivityIconConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

export interface RecentActivityProps {
  contributions?: {
    id: string;
    weight_grams: number;
    karat: number;
    status: string;
    created_date: string;
  }[];
  draws?: {
    id: string;
    winner_name: string;
    round_number: number;
    created_date: string;
  }[];
}

export interface MemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Member | null;
  onSubmit: (data: MemberCreateData | Partial<Member>) => Promise<void>;
}

export interface StatusConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  currentStatus: string;
  memberName: string;
}

export interface WinnerWheelProps {
  eligibleMembers: Member[];
  onWinnerSelected: (winner: Member) => Promise<void>;
}

export interface KaratOption {
  value: string;
  label: string;
}

export interface ContributionForm {
  member_id: string;
  weight_grams: string;
  karat: string;
  date_contributed: string;
  notes: string;
}

export interface ContributionSubmitData {
  member_id: string;
  group_id: string;
  round_number: number;
  weight_grams: number;
  karat: number;
  pure_gold_grams: number;
  date_contributed: string;
  notes: string;
  status: "pending" | "verified" | "rejected";
}

export interface ContributionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: { id: string; full_name: string }[];
  groupId: string;
  currentRound: number;
  onSubmit: (data: ContributionSubmitData) => Promise<void>;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  signIn: (
    phone: string,
    password: string,
  ) => Promise<{ error?: { message: string } }>;
  signUp: (
    name: string,
    phone: string,
    password: string,
  ) => Promise<{ error?: { message: string } }>;
  signOut: () => Promise<void>;
  // Admin functions
  listUsers: () => User[];
  createUser: (userData: any) => Promise<{ error?: { message: string } }>;
  updateUser: (
    id: string,
    userData: any,
  ) => Promise<{ error?: { message: string } }>;
  deleteUser: (id: string) => Promise<{ error?: { message: string } }>;
}
