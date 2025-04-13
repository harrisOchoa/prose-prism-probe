
import React from "react";
import { HelpCircle } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { scoringCriteria } from "@/services/geminiService";

const ScoringCriteriaTooltip: React.FC = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p className="font-medium mb-1">Scoring Criteria:</p>
          <ul className="text-xs space-y-1">
            {Object.entries(scoringCriteria).map(([score, description]) => (
              <li key={score} className="flex gap-2">
                <span className="font-semibold">{score}:</span>
                <span>{description}</span>
              </li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ScoringCriteriaTooltip;
