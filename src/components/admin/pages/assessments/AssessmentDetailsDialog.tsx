
import React, { useState, useCallback } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, RefreshCw, StopCircle, AlertTriangle } from "lucide-react";
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
  
  // Use the evaluation hook to get proper analysis state
  const {
    generatingSummary,
    evaluating,
    canStartAnalysis,
    regenerateInsights,
    handleForceStopAnalysis
  } = useAssessmentEvaluation(localAssessment, setLocalAssessment);

  // Function to handle refreshing assessment data
  const refreshAssessment = useCallback(async () => {
    console.log("Refreshing assessment data in dialog");
    // Return the current assessment data (in a real app, this would fetch from API)
    return localAssessment;
  }, [localAssessment]);

  // Enhanced regenerate insights with proper error handling
  const handleRegenerateInsights = useCallback(async () => {
    if (generatingSummary) {
      toast({
        title: "Already Processing",
        description: "AI analysis is already in progress. Please wait for it to complete.",
      });
      return;
    }
    
    console.log("Regenerating insights in dialog for assessment:", localAssessment?.id);
    
    try {
      const result = await regenerateInsights();
      if (result) {
        // Refresh the local assessment data
        setLocalAssessment(prev => ({
          ...prev,
          // Force a re-render to show updated data
          lastUpdated: new Date().toISOString()
        }));
      }
    } catch (error: any) {
      console.error("Error regenerating insights in dialog:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate insights",
        variant: "destructive",
      });
    }
  }, [generatingSummary, regenerateInsights, localAssessment?.id]);

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

  // Check if we should show the emergency reset button
  const shouldShowEmergencyReset = !canStartAnalysis || generatingSummary || evaluating;

  if (!assessment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-4">
            Assessment Details
            
            {/* Analysis Control Buttons */}
            <div className="flex gap-2 ml-auto">
              {shouldShowEmergencyReset && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleEmergencyReset}
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  Emergency Reset
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRegenerateInsights}
                disabled={generatingSummary || !localAssessment.writingScores || localAssessment.writingScores.length === 0}
              >
                {generatingSummary ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Insights
                  </>
                )}
              </Button>
            </div>
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="py-2">
          <AssessmentDetailsContainer
            assessment={localAssessment}
            onBack={onClose}
            refreshAssessment={refreshAssessment}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentDetailsDialog;
