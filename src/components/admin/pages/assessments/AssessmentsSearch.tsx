
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AssessmentStatus } from "@/hooks/useAdminAssessments";

interface AssessmentsSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  activeTab: 'all' | AssessmentStatus;
  counts: {
    total: number;
    active: number;
    completed: number;
    archived: number;
  };
  getBadgeStyle: (status: string) => string;
}

const AssessmentsSearch: React.FC<AssessmentsSearchProps> = ({
  searchTerm,
  setSearchTerm,
  activeTab,
  counts,
  getBadgeStyle
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <TabsList className="bg-muted dark:bg-slate-800 dark:text-gray-200">
        <TabsTrigger 
          value="all" 
          className="data-[state=active]:bg-background dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
        >
          All Assessments
        </TabsTrigger>
        <TabsTrigger 
          value="active"
          className="data-[state=active]:bg-background dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
        >
          Active 
          <Badge variant="outline" className={`ml-2 ${getBadgeStyle('active')}`}>{counts.active}</Badge>
        </TabsTrigger>
        <TabsTrigger 
          value="completed"
          className="data-[state=active]:bg-background dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
        >
          Completed
          <Badge variant="outline" className={`ml-2 ${getBadgeStyle('completed')}`}>{counts.completed}</Badge>
        </TabsTrigger>
        <TabsTrigger 
          value="archived"
          className="data-[state=active]:bg-background dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
        >
          Archived
          <Badge variant="outline" className={`ml-2 ${getBadgeStyle('archived')}`}>{counts.archived}</Badge>
        </TabsTrigger>
      </TabsList>
      
      <div className="flex gap-2 w-full md:w-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search assessments..." 
            className="pl-10 h-9 dark:bg-slate-800 dark:border-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="flex gap-2 dark:border-slate-700 dark:hover:bg-slate-700">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </Button>
      </div>
    </div>
  );
};

export default AssessmentsSearch;
