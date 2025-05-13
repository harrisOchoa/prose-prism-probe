
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ANIMATION_TYPES } from "@/utils/animation";

interface ThemeToggleProps {
  variant?: "default" | "outline" | "ghost";
  size?: "icon" | "default" | "sm" | "lg";
}

export function ThemeToggle({ 
  variant = "ghost", 
  size = "icon" 
}: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="focus-visible:ring-0">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`${ANIMATION_TYPES.scaleIn} dropdown-content`}>
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={`${theme === "light" ? "bg-accent text-accent-foreground" : ""} dropdown-item`}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={`${theme === "dark" ? "bg-accent text-accent-foreground" : ""} dropdown-item`}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={`${theme === "system" ? "bg-accent text-accent-foreground" : ""} dropdown-item`}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
