
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AdminDashboard from "@/components/AdminDashboard";
import { LockKeyhole, Home } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
        title: "Logged in successfully",
        description: "Welcome to the admin dashboard",
        variant: "default",
      });
    } else {
      toast({
        title: "Authentication failed",
        description: "Please check your password and try again",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className={`container mx-auto ${isMobile ? 'py-4 px-3' : 'py-10 px-4'}`}>
      {!isAuthenticated ? (
        <div className="flex justify-center items-center min-h-[80vh]">
          <Card className="w-full max-w-md shadow-elevation-1 animate-fade-in">
            <CardHeader className="space-y-1">
              <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} text-center gradient-text`}>
                HireScribe Admin
              </CardTitle>
              <CardDescription className={`text-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Enter your password to access the admin dashboard
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
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate("/")}
                  disabled={isLoading}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Return to Home
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
};

export default Admin;
