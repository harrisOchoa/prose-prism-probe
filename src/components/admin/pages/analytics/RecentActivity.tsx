
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnalyticsData } from "@/types/analytics";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  activities: AnalyticsData["recentActivity"];
}

const getColorClass = (color: string): string => {
  switch (color) {
    case "blue-500":
      return "bg-blue-500";
    case "green-500":
      return "bg-green-500";
    case "purple-500":
      return "bg-purple-500";
    case "orange-500":
      return "bg-orange-500";
    default:
      return "bg-blue-500"; // Default fallback
  }
};

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start">
              <div className={cn("h-2 w-2 rounded-full mt-2 mr-3", getColorClass(activity.color))}></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.position} • {activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
