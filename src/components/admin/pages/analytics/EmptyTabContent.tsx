
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import EmptyState from "@/components/admin/dashboard/components/EmptyState";

interface EmptyTabContentProps {
  title: string;
  message: string;
  icon: React.ReactNode;
}

const EmptyTabContent: React.FC<EmptyTabContentProps> = ({ title, message, icon }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] flex items-center justify-center">
        <EmptyState 
          title={title} 
          message={message}
          icon={icon}
        />
      </CardContent>
    </Card>
  );
};

export default EmptyTabContent;
