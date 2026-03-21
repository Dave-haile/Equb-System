import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !password) {
      toast.error("Please enter phone and password");
      return;
    }

    if (!/^[0-9+]+$/.test(phone)) {
      toast.error("Phone can only contain numbers, and plus sign");
      return;
    }

    setLoading(true);
    const { error } = await signIn(phone, password);
    setLoading(false);

    if (error) {
      toast.error(error.message || "Login failed");
      return;
    }

    toast.success("Login successful");
    navigate(from, { replace: true });
  };

  return (
    <div className="theme-hero-bg relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-amber-500/8 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/8 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[320px] w-[320px] rounded-full bg-amber-500/6 blur-[100px]" />
      </div>

      <Card className="theme-glass relative z-10 w-full max-w-lg shadow-2xl">
        <CardHeader className="space-y-2 px-8 pt-8">
          <CardTitle className="bg-linear-to-r from-amber-400 to-yellow-500 bg-clip-text text-center text-4xl font-bold text-transparent">
            Gold Equb System
          </CardTitle>
          <CardDescription className="text-center text-base text-muted-foreground">
            Manage your gold-based rotating savings
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-phone" className="text-foreground/80">
                Phone
              </Label>
              <Input
                id="login-phone"
                type="text"
                placeholder="Enter your phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                autoComplete="username"
                className="h-11 bg-background/70 placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-foreground/80">
                Password
              </Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                className="h-11 bg-background/70 placeholder:text-muted-foreground/60"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="theme-brand-button h-11 w-full text-base font-bold"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
