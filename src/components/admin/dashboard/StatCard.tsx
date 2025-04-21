
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon: Icon, className = "" }) => {
  return (
    <Card className={`card-hover ${className} w-full`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm md:text-base font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 md:h-5 md:w-5 text-hirescribe-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl md:text-3xl font-bold">{value}</div>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

export default StatCard;
