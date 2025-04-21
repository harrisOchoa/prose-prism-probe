
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ searchTerm, setSearchTerm }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold gradient-text`}>Admin Dashboard</h1>
      <div className="relative w-full md:w-auto">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={isMobile ? "Search..." : "Search by name or position..."}
          className="pl-8 w-full md:w-[300px] input-enhanced"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
