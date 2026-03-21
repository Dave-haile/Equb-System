import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Dashboard from "@/components/dashboard/Dashboard";
import GroupsPage from "@/components/groups/GroupsPage";
import LiveDrawPage from "./components/drawing/LiveDrawPage";
import Contributions from "./components/Contribution/Contributions";
import Drawing from "@/components/drawing/Drawing";
import Members from "@/components/members/Members";
import UserManagement from "@/components/admin/UserManagement";
import SettingsPage from "@/components/settings/SettingsPage";
import LoginPage from "@/components/auth/LoginPage";
import Landing from "@/Pages/Landing";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/shared/MainLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        storageKey="goldequb-theme"
      >
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground font-sans antialiased">
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    path="/dashboard"

                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/groups"
                    element={
                      <ProtectedRoute>
                        <GroupsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/draw"
                    element={
                      <ProtectedRoute>
                        <LiveDrawPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/contributions"
                    element={
                      <ProtectedRoute>
                        <Contributions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/drawing"
                    element={
                      <ProtectedRoute>
                        <Drawing />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/members"
                    element={
                      <ProtectedRoute>
                        <Members />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute>
                        <UserManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </MainLayout>
              <Toaster position="top-right" richColors />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
