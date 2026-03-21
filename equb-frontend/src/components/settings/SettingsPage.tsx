import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Lock,
  Bell,
  Shield,
  Palette,
  Globe,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme !== "light";

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 text-foreground">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-amber-500">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="h-auto flex-wrap gap-2 rounded-xl border border-border bg-muted/50 p-1">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
          >
            <Lock className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
          >
            <Palette className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="border-border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription className="text-muted-foreground">
                Update your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue={user?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Add Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="Tell us about yourself" />
              </div>

              <Button className="bg-amber-500 font-bold text-black hover:bg-amber-400">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="border-border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription className="text-muted-foreground">
                Ensure your account is using a long, random password to stay
                secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input id="current_password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input id="new_password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input id="confirm_password" type="password" />
              </div>

              <Button className="bg-amber-500 font-bold text-black hover:bg-amber-400">
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription className="text-muted-foreground">
                Add an extra layer of security to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Authenticator App</p>
                    <p className="text-xs text-muted-foreground">
                      Use an app like Google Authenticator
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card className="border-border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription className="text-muted-foreground">
                Customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Receive alerts for draws and contributions
                    </p>
                  </div>
                </div>

                <div className="relative h-6 w-12 rounded-full bg-amber-500">
                  <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-black" />
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Language</p>
                    <p className="text-xs text-muted-foreground">
                      Select your preferred language
                    </p>
                  </div>
                </div>

                <Button variant="outline" size="sm">
                  English (US)
                </Button>
              </div>

              <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Theme Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Switch between dark and light mode
                    </p>
                  </div>
                </div>

                <div className="flex rounded-lg border border-border bg-muted p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "h-8 gap-2 px-3",
                      isDark
                        ? "bg-amber-500 text-black hover:bg-amber-400"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme("light")}
                    className={cn(
                      "h-8 gap-2 px-3",
                      !isDark
                        ? "bg-amber-500 text-black hover:bg-amber-400"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
