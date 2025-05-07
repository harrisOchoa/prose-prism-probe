
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnalyticsData } from "@/types/analytics";

interface TopPerformingCategoriesProps {
  categories: AnalyticsData["categoryPerformance"];
}

const TopPerformingCategories: React.FC<TopPerformingCategoriesProps> = ({ categories }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top Performing Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{category.name}</span>
                <span className="text-sm font-medium">{category.percentage}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full">
                <div 
                  className="h-2 bg-hirescribe-primary rounded-full" 
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPerformingCategories;
