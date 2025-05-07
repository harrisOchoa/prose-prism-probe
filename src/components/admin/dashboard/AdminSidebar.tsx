
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  FileText, 
  BarChart, 
  HelpCircle, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  
  // Handle logout function
  const handleLogout = () => {
    // In a real app, we would clear auth state here
    navigate("/");
  };

  return (
    <Sidebar>
      <SidebarHeader className="px-4 pt-4">
        <h2 className="text-xl font-bold gradient-text">HireScribe Admin</h2>
        <p className="text-xs text-muted-foreground mt-1">Assessment Management</p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={pathname === "/admin"}
                tooltip="Dashboard" 
                onClick={() => navigate("/admin")}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={pathname === "/admin/candidates"}
                tooltip="Candidates" 
                onClick={() => navigate("/admin/candidates")}
              >
                <Users className="h-4 w-4" />
                <span>Candidates</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={pathname === "/admin/assessments"}
                tooltip="Assessments" 
                onClick={() => navigate("/admin/assessments")}
              >
                <FileText className="h-4 w-4" />
                <span>Assessments</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={pathname === "/admin/analytics"}
                tooltip="Analytics" 
                onClick={() => navigate("/admin/analytics")}
              >
                <BarChart className="h-4 w-4" />
                <span>Analytics</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={pathname === "/admin/settings"}
                tooltip="Settings" 
                onClick={() => navigate("/admin/settings")}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={pathname === "/admin/help"}
                tooltip="Help & Support" 
                onClick={() => navigate("/admin/help")}
              >
                <HelpCircle className="h-4 w-4" />
                <span>Help & Support</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start" 
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
