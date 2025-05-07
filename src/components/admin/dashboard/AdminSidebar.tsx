
import React, { useState, useEffect } from "react";
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
  SidebarTrigger,
  useSidebar
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
  const { state, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isHovering, setIsHovering] = useState(false);
  
  // Set sidebar to collapsed by default when component mounts
  useEffect(() => {
    setOpen(false);
  }, [setOpen]);
  
  // Handle logout function
  const handleLogout = () => {
    // In a real app, we would clear auth state here
    navigate("/");
  };

  return (
    <Sidebar 
      collapsible="icon"
      className="sidebar-container group transition-all duration-300"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <SidebarHeader className="px-4 pt-4 flex items-center justify-between">
        <div className={cn(
          "overflow-hidden transition-all duration-300",
          isHovering && "w-full"
        )}>
          <h2 className="font-bold whitespace-nowrap transition-all duration-300 gradient-text">
            {isCollapsed && !isHovering ? "HS" : "HireScribe Admin"}
          </h2>
          <p className={cn(
            "text-xs text-muted-foreground mt-1 transition-opacity duration-300",
            isCollapsed && !isHovering ? "opacity-0" : "opacity-100"
          )}>
            Assessment Management
          </p>
        </div>
        <SidebarTrigger className="ml-2" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "transition-opacity duration-300",
            isCollapsed && !isHovering ? "opacity-0" : "opacity-100"
          )}>
            Main Navigation
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={pathname === "/admin"}
                tooltip="Dashboard" 
                onClick={() => navigate("/admin")}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className={cn(
                  "transition-opacity duration-300",
                  isCollapsed && !isHovering ? "opacity-0" : "opacity-100"
                )}>
                  Dashboard
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={pathname === "/admin/candidates"}
                tooltip="Candidates" 
                onClick={() => navigate("/admin/candidates")}
              >
                <Users className="h-4 w-4" />
                <span className={cn(
                  "transition-opacity duration-300",
                  isCollapsed && !isHovering ? "opacity-0" : "opacity-100"
                )}>
                  Candidates
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={pathname === "/admin/assessments"}
                tooltip="Assessments" 
                onClick={() => navigate("/admin/assessments")}
              >
                <FileText className="h-4 w-4" />
                <span className={cn(
                  "transition-opacity duration-300",
                  isCollapsed && !isHovering ? "opacity-0" : "opacity-100"
                )}>
                  Assessments
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={pathname === "/admin/analytics"}
                tooltip="Analytics" 
                onClick={() => navigate("/admin/analytics")}
              >
                <BarChart className="h-4 w-4" />
                <span className={cn(
                  "transition-opacity duration-300",
                  isCollapsed && !isHovering ? "opacity-0" : "opacity-100"
                )}>
                  Analytics
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "transition-opacity duration-300",
            isCollapsed && !isHovering ? "opacity-0" : "opacity-100"
          )}>
            Settings
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={pathname === "/admin/settings"}
                tooltip="Settings" 
                onClick={() => navigate("/admin/settings")}
              >
                <Settings className="h-4 w-4" />
                <span className={cn(
                  "transition-opacity duration-300",
                  isCollapsed && !isHovering ? "opacity-0" : "opacity-100"
                )}>
                  Settings
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={pathname === "/admin/help"}
                tooltip="Help & Support" 
                onClick={() => navigate("/admin/help")}
              >
                <HelpCircle className="h-4 w-4" />
                <span className={cn(
                  "transition-opacity duration-300",
                  isCollapsed && !isHovering ? "opacity-0" : "opacity-100"
                )}>
                  Help & Support
                </span>
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
          <span className={cn(
            "transition-opacity duration-300",
            isCollapsed && !isHovering ? "opacity-0" : "opacity-100"
          )}>
            Logout
          </span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
