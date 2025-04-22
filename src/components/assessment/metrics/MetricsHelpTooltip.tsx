
import React from "react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const MetricsHelpTooltip: React.FC = () => {
  return (
    <TooltipProvider>
      <div className="text-xs text-gray-500 mt-2 flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="underline cursor-help">What is this data?</span>
          </TooltipTrigger>
          <TooltipContent className="max-w-md">
            <p>This data helps ensure assessment integrity. High typing speeds, multiple tab switches, or copy/paste attempts may indicate potential unauthorized assistance.</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default MetricsHelpTooltip;

