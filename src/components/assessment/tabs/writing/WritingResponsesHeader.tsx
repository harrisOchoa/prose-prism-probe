
import React from "react";
import { FileText, Edit } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface WritingResponsesHeaderProps {
  responsesCount?: number;
}

const WritingResponsesHeader: React.FC<WritingResponsesHeaderProps> = ({ 
  responsesCount 
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
        <h3 className="text-lg font-medium">
          Writing Responses {responsesCount && `(${responsesCount})`}
        </h3>
      </div>
      <p className="text-sm text-muted-foreground">
        The candidate's written responses to assessment prompts
      </p>
      <Separator className="my-2" />
    </div>
  );
};

export default WritingResponsesHeader;
