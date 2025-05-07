
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

const AdminWelcome: React.FC = () => {
  const isMobile = useIsMobile();
  const currentTime = new Date();
  const hours = currentTime.getHours();
  
  // Determine greeting based on time of day
  let greeting = "Good morning";
  if (hours >= 12 && hours < 17) {
    greeting = "Good afternoon";
  } else if (hours >= 17) {
    greeting = "Good evening";
  }
  
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentTime);

  return (
    <Card className="mb-6 border-none bg-gradient-to-r from-hirescribe-primary/10 to-hirescribe-secondary/10">
      <CardContent className={`flex justify-between items-center ${isMobile ? 'p-4' : 'p-6'}`}>
        <div>
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>{greeting}, Admin</h2>
          <p className="text-muted-foreground text-sm mt-1">Welcome to HireScribe Assessment Dashboard</p>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Clock className="h-4 w-4 mr-2" />
          <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{formattedDate}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminWelcome;
