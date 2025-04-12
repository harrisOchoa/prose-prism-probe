
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AdminDashboard from "@/components/AdminDashboard";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Simple admin authentication (in a real app, this would be more secure)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  return (
    <div className="container mx-auto py-10 px-4">
      {!isAuthenticated ? (
        <div className="flex justify-center items-center min-h-[80vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl text-center">HireScribe Admin Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Input 
                    type="password" 
                    placeholder="Enter admin password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Login</Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate("/")}
                >
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
