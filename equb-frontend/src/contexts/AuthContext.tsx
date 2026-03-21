import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, AuthContextType } from "@/types";
import api from "@/api/api";
import { cookieStore } from "@/lib/cookieStore";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = cookieStore.get("token");

    if (!savedToken) {
      setLoading(false);
      return;
    }

    setToken(savedToken);

    (async () => {
      try {
        const response = await api.get("/api/me", {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
        setUser(response.data.user);
        console.log(response.data.user);
      } catch (error: any) {
        console.error(error);
        cookieStore.remove("token");
        toast.error(error.message || "Session expired. Please login again.");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // save token to Cookie
  useEffect(() => {
    if (token) {
      cookieStore.set("token", token, {
        days: 7,
        secure: window.location.protocol === "https:",
        sameSite: "Strict",
      });
    }
  }, [token]);

  const signIn = async (phone: string, password: string) => {
    console.log("Signing in with:", phone, password);
    setLoading(true);
    try {
      const response = await api.post("/api/auth/login", {
        phone,
        password,
      });
      console.log(response.data);
      setUser(response.data.user);
      setToken(response.data.token);
      return {};
    } catch (error: any) {
      console.error(error);
      return { error: { message: error.response?.data?.message || "Network error. Please try again." } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, phone: string, password: string) => {
    console.log(name, phone, password);
    return {};
  };

  const signOut = async () => {
    setUser(null);
    setToken(null);
    cookieStore.remove("token");
  };

  // Admin functions
  const listUsers = () => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return users.map(({ password: _, ...u }: any) => u);
  };

  const createUser = async (userData: any) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    if (users.find((u: any) => u.username === userData.username)) {
      return { error: { message: "Username already exists" } };
    }
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      ...userData,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    return {};
  };

  const updateUser = async (id: string, userData: any) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const index = users.findIndex((u: any) => u.id === id);
    if (index === -1) return { error: { message: "User not found" } };

    // Check if new username exists for another user
    if (
      userData.username &&
      users.some((u: any) => u.username === userData.username && u.id !== id)
    ) {
      return { error: { message: "Username already exists" } };
    }

    users[index] = { ...users[index], ...userData };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Update current user if it's the one being updated
    if (user?.id === id) {
      const { password: _, ...userWithoutPassword } = users[index];
      setUser(userWithoutPassword);
      localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
    }

    return {};
  };

  const deleteUser = async (id: string) => {
    if (user?.id === id)
      return { error: { message: "Cannot delete yourself" } };
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const updatedUsers = users.filter((u: any) => u.id !== id);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    return {};
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        signIn,
        signUp,
        signOut,
        listUsers,
        createUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
