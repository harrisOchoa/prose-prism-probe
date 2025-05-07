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

  // Define navigation items with exact paths
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
  return <Sidebar className="border-r border-gray-200 h-screen">
      <SidebarHeader className="px-4 py-6">
        <div className="flex items-center">
          
          <div className="ml-1 text-hirescribe-primary font-medium">
            <span>HireScribe Admin</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 mb-2 font-semibold text-gray-500">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarMenu>
            {mainNavItems.map(item => <SidebarMenuItem key={item.path}>
                <SidebarMenuButton onClick={() => navigate(item.path)} className={cn("flex items-center px-4 py-3 w-full rounded-md transition-colors", pathname === item.path ? 'bg-purple-50 text-hirescribe-primary font-medium' : 'hover:bg-gray-50')} tooltip={item.label}>
                  <div className={cn("mr-3", pathname === item.path ? "text-hirescribe-primary" : "text-gray-500")}>
                    {item.icon}
                  </div>
                  <span className={pathname === item.path ? "text-hirescribe-primary" : "text-gray-700"}>
                    {item.label}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>)}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-4 mb-2 font-semibold text-gray-500">
            Settings
          </SidebarGroupLabel>
          <SidebarMenu>
            {settingsNavItems.map(item => <SidebarMenuItem key={item.path}>
                <SidebarMenuButton onClick={() => navigate(item.path)} className={cn("flex items-center px-4 py-3 w-full rounded-md transition-colors", pathname === item.path ? 'bg-purple-50 text-hirescribe-primary font-medium' : 'hover:bg-gray-50')} tooltip={item.label}>
                  <div className={cn("mr-3", pathname === item.path ? "text-hirescribe-primary" : "text-gray-500")}>
                    {item.icon}
                  </div>
                  <span className={pathname === item.path ? "text-hirescribe-primary" : "text-gray-700"}>
                    {item.label}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>)}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto border-t border-gray-200">
        <Button variant="outline" size="sm" className="flex items-center justify-start w-full py-2.5 text-gray-700 hover:text-red-600 hover:border-red-200 transition-colors" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>;
};
export default AdminSidebar;