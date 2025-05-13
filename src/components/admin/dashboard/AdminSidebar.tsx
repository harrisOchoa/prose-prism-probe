
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Settings, FileText, BarChart, HelpCircle, LogOut } from "lucide-react";
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

  // Define navigation items with exact paths - removed descriptions
  const mainNavItems = [{
    path: "/admin/",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />
  }, {
    path: "/admin/candidates",
    label: "Candidates",
    icon: <Users className="h-5 w-5" />
  }, {
    path: "/admin/assessments",
    label: "Assessments",
    icon: <FileText className="h-5 w-5" />
  }, {
    path: "/admin/analytics",
    label: "Analytics",
    icon: <BarChart className="h-5 w-5" />
  }];
  
  const settingsNavItems = [{
    path: "/admin/settings",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />
  }, {
    path: "/admin/help",
    label: "Help & Support",
    icon: <HelpCircle className="h-5 w-5" />
  }];
  
  // Check if a path is active
  const isActive = (path: string) => {
    if (path === '/admin/' && pathname === '/admin/') {
      return true;
    }
    return pathname.startsWith(path) && path !== '/admin/';
  };
  
  return <Sidebar className="border-r border-gray-200 h-screen">
      <SidebarHeader className="px-4 py-6">
        <div className="flex items-center">
          <div className="ml-1 font-medium text-xl gradient-text">
            <span>HireScribe Admin</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-3">
        <SidebarGroup className="admin-sidebar-group">
          <SidebarGroupLabel className="sidebar-group-label">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarMenu>
            {mainNavItems.map(item => 
              <SidebarMenuItem key={item.path} className="py-0.5">
                <SidebarMenuButton 
                  onClick={() => navigate(item.path)} 
                  isActive={isActive(item.path)}
                  className={cn(
                    "admin-sidebar-menu-button-simplified", 
                    isActive(item.path) 
                      ? 'bg-purple-50 text-hirescribe-primary' 
                      : 'hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center w-full">
                    <div className={cn(
                      "admin-sidebar-icon-wrapper", 
                      isActive(item.path) 
                        ? "text-hirescribe-primary" 
                        : "text-gray-500"
                    )}>
                      {item.icon}
                    </div>
                    <span className={cn(
                      "admin-sidebar-menu-button-label",
                      isActive(item.path) ? "text-hirescribe-primary" : "text-gray-700"
                    )}>
                      {item.label}
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="admin-sidebar-group mt-2">
          <SidebarGroupLabel className="sidebar-group-label">
            Settings
          </SidebarGroupLabel>
          <SidebarMenu>
            {settingsNavItems.map(item => 
              <SidebarMenuItem key={item.path} className="py-0.5">
                <SidebarMenuButton 
                  onClick={() => navigate(item.path)} 
                  isActive={isActive(item.path)}
                  className={cn(
                    "admin-sidebar-menu-button-simplified", 
                    isActive(item.path) 
                      ? 'bg-purple-50 text-hirescribe-primary' 
                      : 'hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center w-full">
                    <div className={cn(
                      "admin-sidebar-icon-wrapper", 
                      isActive(item.path) 
                        ? "text-hirescribe-primary" 
                        : "text-gray-500"
                    )}>
                      {item.icon}
                    </div>
                    <span className={cn(
                      "admin-sidebar-menu-button-label",
                      isActive(item.path) ? "text-hirescribe-primary" : "text-gray-700"
                    )}>
                      {item.label}
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto border-t border-gray-200">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center justify-start w-full py-2.5 text-gray-700 hover:text-red-600 hover:border-red-200 transition-all" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>;
};

export default AdminSidebar;
