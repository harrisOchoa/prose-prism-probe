
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Home, Users, HelpCircle, Settings } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <nav className="border-b bg-white dark:bg-gray-900 py-3 px-4 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-r from-hirescribe-primary to-hirescribe-accent">
              <span className="font-bold text-white text-lg">H</span>
            </div>
            {!isMobile && (
              <span className="font-semibold text-lg gradient-text">HireScribe</span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {!isMobile ? (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/" className="flex items-center gap-1 px-3 py-2 text-sm font-medium hover:text-hirescribe-primary">
                      <Home className="w-4 h-4" />
                      Home
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/admin" className="flex items-center gap-1 px-3 py-2 text-sm font-medium hover:text-hirescribe-primary">
                      <Users className="w-4 h-4" />
                      Assessments
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center gap-1 text-sm font-medium">
                    <HelpCircle className="w-4 h-4" />
                    Help
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-2 p-2">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/faq" className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                            FAQ
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="mailto:support@hirescribe.com" className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                            Contact Support
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          ) : (
            <Button variant="outline" size="icon" onClick={() => navigate("/")}>
              <Home className="h-4 w-4" />
            </Button>
          )}

          <Button variant="outline" size="icon" onClick={() => navigate("/admin")}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
