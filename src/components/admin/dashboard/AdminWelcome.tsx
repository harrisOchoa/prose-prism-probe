
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <Card className="mb-6 border-none overflow-hidden bg-gradient-to-r from-hirescribe-primary/10 to-hirescribe-secondary/10">
      <CardContent className={`flex flex-col md:flex-row justify-between items-center gap-4 ${isMobile ? 'p-4' : 'p-6'}`}>
        <div>
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>{greeting}, Admin</h2>
          <p className="text-muted-foreground text-sm mt-1">Welcome to HireScribe Assessment Dashboard</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center text-muted-foreground bg-background/80 px-3 py-1.5 rounded-md shadow-sm">
            <Calendar className="h-4 w-4 mr-2 text-hirescribe-primary" />
            <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{formattedDate}</span>
          </div>
          
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-hirescribe-primary text-white rounded-full">3</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminWelcome;
