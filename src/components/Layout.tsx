
import React from "react";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink 
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { pathname } = location;
  
  // Get the stage from URL search params if available
  const searchParams = new URLSearchParams(location.search);
  const stage = searchParams.get('stage');
  
  // Hide header during assessment stages (aptitude, prompt selection, and writing)
  const hideHeader = stage === 'aptitude' || stage === 'writing' || stage === 'select_prompts';
  
  // Also hide header on admin views and assessment view page
  const isAdminOrViewPage = pathname.includes('/admin') || pathname.includes('/view');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hideHeader && !isAdminOrViewPage && (
        <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-hirescribe-primary to-hirescribe-accent">
              HireScribe
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/">
                    <NavigationMenuLink className={cn(
                      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      "px-4 py-2"
                    )}>
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/about">
                    <NavigationMenuLink className={cn(
                      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      "px-4 py-2"
                    )}>
                      About
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </header>
      )}
      <main className={cn(
        "flex-1 container mx-auto px-4 py-8 md:px-8",
        hideHeader && "pt-16" // Add extra padding when header is hidden to compensate for timer position
      )}>
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
