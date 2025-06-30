
import React, { useState, useCallback } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, StopCircle, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AssessmentDetailsContainer from "@/components/assessment-details";
import { useAssessmentEvaluation } from "@/hooks/useAssessmentEvaluation";

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
  const [localAssessment, setLocalAssessment] = useState(assessment);
  
  // Add debugging to see what assessment data we're receiving
  console.log("AssessmentDetailsDialog received assessment:", {
    hasAssessment: !!assessment,
    assessmentId: assessment?.id,
    assessmentKeys: assessment ? Object.keys(assessment) : [],
    fullAssessment: assessment
  });
  
  // Use the evaluation hook to get proper analysis state
  const {
    generatingSummary,
    evaluating,
    canStartAnalysis,
    handleForceStopAnalysis
  } = useAssessmentEvaluation(localAssessment, setLocalAssessment);

  // Function to handle refreshing assessment data
  const refreshAssessment = useCallback(async () => {
    console.log("Refreshing assessment data in dialog");
    // Return the current assessment data (in a real app, this would fetch from API)
    return localAssessment;
  }, [localAssessment]);

  // Emergency reset for stuck analysis
  const handleEmergencyReset = useCallback(() => {
    if (window.confirm('This will force stop all analysis and clear the stuck state. Continue?')) {
      console.log('🚨 Emergency reset in dialog');
      
      // Clear analysis state from storage
      try {
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
          if (key.includes('analysis') || key.includes('generating')) {
            sessionStorage.removeItem(key);
            console.log('Cleared session key:', key);
          }
        });
        
        const localKeys = Object.keys(localStorage);
        localKeys.forEach(key => {
          if (key.includes('analysis') || key.includes('generating')) {
            localStorage.removeItem(key);
            console.log('Cleared local key:', key);
          }
        });
      } catch (error) {
        console.error('Error clearing storage:', error);
      }
      
      // Reset local state
      setLocalAssessment(prev => ({
        ...prev,
        analysisStatus: 'idle',
        analysisError: null,
        lastUpdated: new Date().toISOString()
      }));
      
      toast({
        title: "Analysis Reset",
        description: "Analysis state has been cleared. Try generating insights again.",
      });
    }
  }, []);

  // Check if we should show the emergency reset button - fix canStartAnalysis usage
  const shouldShowEmergencyReset = typeof canStartAnalysis === 'function' ? !canStartAnalysis() : !canStartAnalysis || generatingSummary || evaluating;

  // Custom close handler to prevent event bubbling
  const handleClose = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    onClose();
  }, [onClose]);

  // If no assessment data is provided, show error message
  if (!assessment) {
    console.error("No assessment data provided to AssessmentDetailsDialog");
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader className="relative">
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Error Loading Assessment
            </DialogTitle>
            {/* Custom close button to replace DialogClose */}
            <button 
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              No assessment data was provided. This might be a temporary issue.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-4">
            Assessment Details
            
            {/* Only Emergency Reset Button in Header */}
            {shouldShowEmergencyReset && (
              <div className="flex gap-2 ml-auto">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleEmergencyReset}
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  Emergency Reset
                </Button>
              </div>
            )}
          </DialogTitle>
          {/* Custom close button to replace DialogClose and prevent duplicate */}
          <button 
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>
        
        <div className="py-2">
          <AssessmentDetailsContainer
            assessment={localAssessment}
            onBack={handleClose}
            refreshAssessment={refreshAssessment}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentDetailsDialog;
