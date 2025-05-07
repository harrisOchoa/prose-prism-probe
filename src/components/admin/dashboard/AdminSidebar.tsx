
import React, { useState } from "react";
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
import { cn } from "@/lib/utils";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  
  // Handle logout function
  const handleLogout = () => {
    // In a real app, we would clear auth state here
    navigate("/");
  };

  // Define navigation items
  const mainNavItems = [
    { 
      path: "/admin", 
      label: "Dashboard", 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      path: "/admin/candidates", 
      label: "Candidates", 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      path: "/admin/assessments", 
      label: "Assessments", 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      path: "/admin/analytics", 
      label: "Analytics", 
      icon: <BarChart className="h-5 w-5" /> 
    },
  ];

  const settingsNavItems = [
    { 
      path: "/admin/settings", 
      label: "Settings", 
      icon: <Settings className="h-5 w-5" /> 
    },
    { 
      path: "/admin/help", 
      label: "Help & Support", 
      icon: <HelpCircle className="h-5 w-5" /> 
    },
  ];

  return (
    <Sidebar className="bg-sidebar border-r border-gray-200 h-screen">
      <SidebarHeader className="p-4">
        <div className="flex items-center">
          <div className="text-hirescribe-primary text-xl font-bold">HS</div>
          <div className="ml-1 text-hirescribe-primary">
            <span>ireScribe Admin</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 mb-2">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  onClick={() => navigate(item.path)}
                  className={cn("flex items-center px-4 py-2 w-full", pathname === item.path ? 'bg-gray-100 text-hirescribe-primary' : '')}
                >
                  <div className="flex items-center">
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-4 mb-2">
            Settings
          </SidebarGroupLabel>
          <SidebarMenu>
            {settingsNavItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  onClick={() => navigate(item.path)}
                  className={cn("flex items-center px-4 py-2 w-full", pathname === item.path ? 'bg-gray-100 text-hirescribe-primary' : '')}
                >
                  <div className="flex items-center">
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center justify-start w-full" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="ml-2">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
