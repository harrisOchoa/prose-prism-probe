
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TabHeaderProps {
  loading: boolean;
  handleGenerateAnalysis: () => void;
  getAnalysisButtonLabel: (type: string) => string;
  analysisType: string;
}

const TabHeader: React.FC<TabHeaderProps> = ({
  loading,
  handleGenerateAnalysis,
  getAnalysisButtonLabel,
  analysisType
}) => {
  return (
    <div className="flex justify-end">
      <Button 
        onClick={() => handleGenerateAnalysis()}
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {getAnalysisButtonLabel(analysisType)}
      </Button>
    </div>
  );
};

export default TabHeader;
