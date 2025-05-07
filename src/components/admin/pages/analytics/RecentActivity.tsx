
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnalyticsData } from "@/types/analytics";

interface RecentActivityProps {
  activities: AnalyticsData["recentActivity"];
}

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
              <div className={`h-2 w-2 rounded-full bg-${activity.color} mt-2 mr-3`}></div>
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
