
import React from "react";
import { Search, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ searchTerm, setSearchTerm }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="flex flex-col">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold gradient-text`}>Assessment Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage and review all candidate assessments</p>
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isMobile ? "Search..." : "Search by name or position..."}
            className="pl-8 w-full md:w-[280px] input-enhanced"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate("/")}
          title="Return to Home"
          className="hidden md:flex"
        >
          <Home className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
