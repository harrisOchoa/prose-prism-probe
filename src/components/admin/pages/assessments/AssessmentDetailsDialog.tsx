
import React from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import AssessmentDetailsContainer from "@/components/assessment-details";

interface AssessmentDetailsDialogProps {
  assessment: any;
  isOpen: boolean;
  onClose: () => void;
}

const AssessmentDetailsDialog: React.FC<AssessmentDetailsDialogProps> = ({
  assessment,
  isOpen,
  onClose
}) => {
  // Function to handle refreshing assessment data
  const refreshAssessment = async () => {
    // This would typically call an API to refresh the assessment data
    // For now, we'll just return the existing assessment
    return assessment;
  };

  if (!assessment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle>Assessment Details</DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="py-2">
          <AssessmentDetailsContainer
            assessment={assessment}
            onBack={onClose}
            refreshAssessment={refreshAssessment}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentDetailsDialog;
