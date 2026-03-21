import { useState } from "react";
import { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  User as UserIcon,
  Loader2,
} from "lucide-react";

import api from "@/api/api";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/types";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UserManagement() {
  const { user: currentUser, token } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    role: "Member" as "Admin" | "Member",
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await api.get("/api/admin/users", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
    enabled: !!token && currentUser?.role === "Admin",
    staleTime: 30_000,
  });

  const createUserMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      phone: string;
      password: string;
      role: "Admin" | "Member";
    }) => {
      const res = await api.post("/api/admin/users", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const updateUserMutation = useMutation({
    mutationFn: async (params: {
      id: string;
      payload: {
        name: string;
        phone: string;
        role: "Admin" | "Member";
        password?: string;
      };
    }) => {
      const res = await api.patch(
        `/api/admin/users/${params.id}`,
        params.payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      return res.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/admin/users/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const handleOpenModal = (userToEdit: User | null = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setFormData({
        name: userToEdit.name,
        phone: userToEdit.phone,
        password: "",
        role: userToEdit.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        phone: "",
        password: "",
        role: "Member",
      });
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Phone is required");
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error("Password is required for new users");
      return;
    }

    setLoading(true);

    if (editingUser) {
      const updateData: {
        name: string;
        phone: string;
        role: "Admin" | "Member";
        password?: string;
      } = {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      try {
        await updateUserMutation.mutateAsync({
          id: editingUser.id,
          payload: updateData,
        });
        toast.success("User updated");
        setIsModalOpen(false);
      } catch (error) {
        toast.error(
          (error as AxiosError<{ message?: string }>)?.response?.data
            ?.message || "Failed to update user",
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    try {
      await createUserMutation.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });
      toast.success("User created");
      setIsModalOpen(false);
    } catch (error) {
      toast.error(
        (error as AxiosError<{ message?: string }>)?.response?.data?.message ||
          "Failed to create user",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      toast.success("User deleted");
    } catch (error) {
      toast.error(
        (error as AxiosError<{ message?: string }>)?.response?.data?.message ||
          "Failed to delete user",
      );
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (currentUser?.role !== "Admin") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6 text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-red-500 opacity-50" />
            <h2 className="mb-2 text-xl font-bold text-red-500">
              Access Denied
            </h2>
            <p className="text-muted-foreground">
              Only administrators can access this module.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 text-foreground">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Create and manage system user accounts
          </p>
        </div>

        <Button
          onClick={() => handleOpenModal()}
          className="theme-brand-button font-medium"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      <Card className="border-border bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="bg-background/70 pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                  <TableHead className="text-muted-foreground">
                    Created At
                  </TableHead>
                  <TableHead className="text-right text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {usersLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow
                      key={u.id}
                      className="border-border hover:bg-muted/40"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10">
                            <UserIcon className="h-4 w-4 text-amber-500" />
                          </div>

                          <span className="font-medium">{u.name}</span>

                          {u.id === currentUser?.id && (
                            <Badge
                              variant="outline"
                              className="border-amber-400/20 bg-amber-400/5 text-[10px] text-amber-400"
                            >
                              You
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            u.role === "Admin"
                              ? "border-amber-400/20 bg-amber-400/5 text-amber-400"
                              : "border-blue-400/20 bg-blue-400/5 text-blue-400"
                          }
                        >
                          {u.role}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted hover:text-foreground"
                            onClick={() => handleOpenModal(u)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-500"
                            disabled={u.id === currentUser?.id}
                            onClick={() => handleDelete(u)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="h-[500px] border-border bg-card text-card-foreground sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Create New User"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingUser
                ? "Update account details or change password."
                : "Add a new user to the system."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground/80">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter name"
                className="bg-background/70"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground/80">
                Phone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter phone"
                className="bg-background/70"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/80">
                {editingUser
                  ? "New Password (leave blank to keep current)"
                  : "Password"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={
                  editingUser ? "Enter new password" : "Enter password"
                }
                className="bg-background/70"
                required={!editingUser}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-foreground/80">
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(v: "Admin" | "Member") =>
                  setFormData({ ...formData, role: v })
                }
              >
                <SelectTrigger className="bg-background/70">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover text-popover-foreground">
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="theme-brand-button font-bold"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingUser ? (
                  "Save Changes"
                ) : (
                  "Create User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="border-border bg-card text-card-foreground sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This action cannot be undone. Are you sure you want to permanently
              delete this user account?
            </DialogDescription>
          </DialogHeader>

          {userToDelete && (
            <div className="py-4">
              <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10">
                  <UserIcon className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium">{userToDelete.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {userToDelete.phone}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={confirmDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
