
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";

interface AnalyticsHeaderProps {
  timePeriod: string;
  setTimePeriod: (value: string) => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ 
  timePeriod, 
  setTimePeriod 
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Assessment performance and insights</p>
      </div>
      
      <div className="flex gap-2">
        <Select 
          defaultValue={timePeriod} 
          onValueChange={setTimePeriod}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 3 months</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="flex gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
