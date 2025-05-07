
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  trendValue,
  className = "",
  iconColor = "text-hirescribe-primary bg-hirescribe-primary/10"
}) => {
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 hover:shadow-md group", 
      className
    )}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
              {trend && (
                <div className={cn(
                  "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full",
                  trend === "up" ? "text-green-500 bg-green-500/10" : 
                  trend === "down" ? "text-red-500 bg-red-500/10" : 
                  "text-gray-500 bg-gray-500/10"
                )}>
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className={cn(
            "p-3 rounded-full transition-all duration-200 group-hover:scale-110",
            iconColor
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
