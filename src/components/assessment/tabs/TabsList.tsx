
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface TabsListProps {
  isMobile: boolean;
}

const AssessmentTabsList: React.FC<TabsListProps> = ({ isMobile }) => {
  return (
    <TabsList className={`w-full bg-muted/50 p-0 ${isMobile ? 'flex-wrap' : ''}`}>
      <TabsTrigger 
        value="overview" 
        className={`${isMobile ? 'text-xs py-2 flex-1' : 'flex-1 py-3'} data-[state=active]:bg-background rounded-none data-[state=active]:shadow`}
      >
        Overview
      </TabsTrigger>
      <TabsTrigger 
        value="aptitude" 
        className={`${isMobile ? 'text-xs py-2 flex-1' : 'flex-1 py-3'} data-[state=active]:bg-background rounded-none data-[state=active]:shadow`}
      >
        {isMobile ? "Aptitude" : "Aptitude Results"}
      </TabsTrigger>
      <TabsTrigger 
        value="writing" 
        className={`${isMobile ? 'text-xs py-2 flex-1' : 'flex-1 py-3'} data-[state=active]:bg-background rounded-none data-[state=active]:shadow`}
      >
        {isMobile ? "Writing" : "Writing Assessment"}
      </TabsTrigger>
      <TabsTrigger 
        value="advanced" 
        className={`${isMobile ? 'text-xs py-2 flex-1' : 'flex-1 py-3'} data-[state=active]:bg-background rounded-none data-[state=active]:shadow`}
      >
        {isMobile ? "Analysis" : "Advanced Analysis"}
      </TabsTrigger>
      <TabsTrigger 
        value="comparison" 
        className={`${isMobile ? 'text-xs py-2 flex-1' : 'flex-1 py-3'} data-[state=active]:bg-background rounded-none data-[state=active]:shadow`}
      >
        {isMobile ? "Compare" : "Comparison"}
      </TabsTrigger>
    </TabsList>
  );
};

export default AssessmentTabsList;
