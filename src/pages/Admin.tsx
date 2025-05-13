
import React, { useState, useEffect } from "react";
import { useNavigate, Route, Routes, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AdminDashboard from "@/components/AdminDashboard";
import AdminSidebar from "@/components/admin/dashboard/AdminSidebar";
import { LockKeyhole, Home, ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarProvider } from "@/components/ui/sidebar";

// Import the pages directly (not using lazy loading which might be causing the issue)
import CandidatesPage from "@/components/admin/pages/CandidatesPage";
import AssessmentsPage from "@/components/admin/pages/AssessmentsPage";
import AnalyticsPage from "@/components/admin/pages/AnalyticsPage";
import SettingsPage from "@/components/admin/pages/SettingsPage";
import HelpPage from "@/components/admin/pages/HelpPage";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Check if we're at the exact /admin route and redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      // Make sure we're redirecting to the dashboard from any admin route
      if (window.location.pathname === "/admin" || window.location.pathname === "/admin/") {
        navigate("/admin/", { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  // Simple admin authentication (in a real app, this would be more secure)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Simple password check - in a real app, this would be server-side
    if (password === "hirescribe123") {
      setIsAuthenticated(true);
      toast({
        title: "Authenticated successfully",
        description: "Welcome to the HireScribe admin dashboard",
        variant: "default",
      });
      
      // Navigate explicitly to dashboard after authentication
      navigate("/admin/", { replace: true });
    } else {
      toast({
        title: "Authentication failed",
        description: "The password you entered is incorrect",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className={`container mx-auto ${isMobile ? 'py-6 px-3' : 'py-10 px-4'} max-w-full h-full p-0`}>
      {!isAuthenticated ? (
        <div className="flex justify-center items-center min-h-[80vh]">
          <Card className="w-full max-w-md shadow-md bg-card border animate-fade-in">
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} text-center gradient-text`}>
                HireScribe Admin
              </CardTitle>
              <CardDescription className={`text-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Enter your password to access the administrative dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input 
                      type="password" 
                      placeholder="Enter admin password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 input-enhanced"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-hirescribe-primary hover:bg-hirescribe-accent transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2"></div>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate("/")}
                  disabled={isLoading}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Return Home
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex min-h-[80vh] w-full bg-background overflow-hidden">
          <SidebarProvider>
            <div className="flex w-full">
              <AdminSidebar />
              <div className="flex-1 p-6 overflow-auto">
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/candidates" element={<CandidatesPage />} />
                  <Route path="/assessments" element={<AssessmentsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="*" element={<Navigate to="./" replace />} />
                </Routes>
              </div>
            </div>
          </SidebarProvider>
        </div>
      )}
    </div>
  );
};

export default Admin;
