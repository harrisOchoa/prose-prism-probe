
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, FileText, Brain, BarChart, 
  Download, Loader2, RefreshCw, AlertTriangle, StopCircle 
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";

interface AssessmentHeaderProps {
  assessmentData: any;
  onBack: () => void;
  evaluating: boolean;
  generatingSummary: boolean;
  handleManualEvaluation: () => Promise<any>;
  regenerateInsights: () => Promise<any>;
  handleExportPdf: (
    assessmentData: any, 
    contentType: "Overview" | "Aptitude" | "Writing" | "WritingAnalysis" | "Personality" | "ProfileMatch" | "InterviewQuestions" | string[],
    templateName?: string
  ) => Promise<void>;
}

const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  assessmentData,
  onBack,
  evaluating,
  generatingSummary,
  handleManualEvaluation,
  regenerateInsights,
  handleExportPdf
}) => {
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const activeTab = searchParams.get("tab") || "overview";
  const [stuckAnalysisDetected, setStuckAnalysisDetected] = useState(false);

  // Detect stuck analysis states
  useEffect(() => {
    const checkForStuckAnalysis = () => {
      const now = Date.now();
      const keys = Object.keys(sessionStorage);
      
      // Check for analysis start times that are too old
      for (const key of keys) {
        if (key.includes('analysis-start-')) {
          const startTime = parseInt(sessionStorage.getItem(key) || '0');
          if (startTime && (now - startTime) > 300000) { // 5 minutes
            console.log('🚨 Detected stuck analysis:', key, 'started:', new Date(startTime));
            setStuckAnalysisDetected(true);
            return;
          }
        }
      }
      
      // Check for localStorage indicators of stuck state
      const localKeys = Object.keys(localStorage);
      for (const key of localKeys) {
        if (key.includes('generating') || key.includes('analysis')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.timestamp && (now - data.timestamp) > 300000) {
              console.log('🚨 Detected stuck analysis in localStorage:', key);
              setStuckAnalysisDetected(true);
              return;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
      
      setStuckAnalysisDetected(false);
    };

    // Check immediately and then every 30 seconds
    checkForStuckAnalysis();
    const interval = setInterval(checkForStuckAnalysis, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Enhanced emergency reset function
  const handleEmergencyReset = () => {
    if (window.confirm('This will force stop all analysis and reload the page. This should fix any stuck analysis states. Continue?')) {
      console.log('🚨 Emergency analysis reset triggered');
      
      toast({
        title: "Emergency Reset",
        description: "Clearing all analysis state and reloading...",
      });
      
      // Clear all possible stuck state from storage
      try {
        // Clear sessionStorage
        const sessionKeys = Object.keys(sessionStorage);
        sessionKeys.forEach(key => {
          if (key.includes('analysis') || key.includes('generating') || key.includes('evaluating')) {
            sessionStorage.removeItem(key);
            console.log('Cleared session key:', key);
          }
        });
        
        // Clear localStorage  
        const localKeys = Object.keys(localStorage);
        localKeys.forEach(key => {
          if (key.includes('analysis') || key.includes('generating') || key.includes('evaluating')) {
            localStorage.removeItem(key);
            console.log('Cleared local key:', key);
          }
        });
        
        // Clear any cached analysis states
        const assessmentKeys = Object.keys(localStorage).filter(k => k.startsWith('assessment-'));
        assessmentKeys.forEach(key => {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.analysisStatus || data.evaluating || data.generatingSummary) {
              localStorage.removeItem(key);
              console.log('Cleared cached assessment:', key);
            }
          } catch (e) {
            // Ignore parse errors
          }
        });
        
      } catch (error) {
        console.error('Error clearing storage:', error);
      }
      
      // Force reload after a short delay
      setTimeout(() => {
        console.log('🔄 Force reloading page to reset all state');
        window.location.reload();
      }, 1000);
    }
  };

  const getButtonLabel = () => {
    if (evaluating) {
      return "Evaluating...";
    }
    
    if (!assessmentData.writingScores || assessmentData.writingScores.length === 0) {
      return "Evaluate Writing";
    }
    
    const hasValidScores = assessmentData.writingScores.some((score: any) => score.score > 0);
    if (!hasValidScores) {
      return "Retry Evaluation";
    }
    
    return "Re-Evaluate Writing";
  };

  const handleRegenerateInsightsWithFeedback = async () => {
    if (generatingSummary) {
      toast({
        title: "Already Processing",
        description: "AI analysis is already in progress. Please wait for it to complete.",
      });
      return;
    }
    
    // Show initial toast
    const toastId = toast({
      title: "Regenerating Insights",
      description: "This may take a moment. If the AI service is rate limited, the system will retry automatically.",
      duration: 5000,
    });
    
    try {
      const result = await regenerateInsights();
      
      if (result) {
        // Success toast already shown by the regenerateInsights function
      } else {
        // Check if there was a rate limit error
        if (assessmentData.analysisError && 
            assessmentData.analysisError.toLowerCase().includes('rate limit')) {
          toast({
            title: "API Rate Limited",
            description: "The AI service is currently rate limited. Please try again in a few minutes.",
            variant: "destructive",
            duration: 10000,
          });
        }
      }
    } catch (error: any) {
      console.error("Error regenerating insights:", error);
      
      // Show appropriate toast based on error type
      if (error.message && error.message.toLowerCase().includes('rate limit')) {
        toast({
          title: "Rate Limit Error",
          description: "The AI service is currently rate limited. Please try again in a few minutes.",
          variant: "destructive",
          duration: 10000,
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "An unknown error occurred",
          variant: "destructive",
        });
      }
    }
  };

  // Create PDF export functions
  const exportCurrentView = () => {
    if (!assessmentData) return;
    
    let contentType: any = "Overview";
    switch (activeTab) {
      case "aptitude":
        contentType = "Aptitude";
        break;
      case "writing":
        contentType = "Writing";
        break;
      case "advanced":
        contentType = "WritingAnalysis";
        break;
      case "interview":
      case "questions":
        contentType = "InterviewQuestions";
        break;
      case "personality":
        contentType = "Personality";
        break;
      case "comparison":
        contentType = "ProfileMatch";
        break;
      default:
        contentType = "Overview";
    }
    
    toast({
      title: "Generating PDF",
      description: `Creating PDF for the ${activeTab} section...`,
    });
    
    handleExportPdf(assessmentData, contentType);
  };
  
  const exportFullReport = () => {
    if (!assessmentData) return;
    
    toast({
      title: "Generating Full Report",
      description: "Creating a comprehensive PDF report with all sections...",
    });
    
    const allSections = ["Overview", "Aptitude", "Writing", "WritingAnalysis"];
    handleExportPdf(assessmentData, allSections, "Full Assessment Report");
  };

  // Determine if we should show force stop button
  const shouldShowForceStop = evaluating || generatingSummary || stuckAnalysisDetected;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm"
          className="mr-2" 
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-xl md:text-2xl font-semibold">
          Assessment Details
        </h1>
      </div>
      
      <div className={`flex gap-2 flex-wrap ${isMobile ? 'w-full' : ''}`}>
        {/* Always-visible Force Stop Button when analysis is stuck */}
        {shouldShowForceStop && (
          <Button 
            variant="destructive" 
            size={isMobile ? "sm" : "default"}
            className="flex-1 md:flex-none"
            onClick={handleEmergencyReset}
          >
            <StopCircle className="h-4 w-4 mr-2" />
            {stuckAnalysisDetected ? "Emergency Reset" : "Force Stop"}
          </Button>
        )}
        
        {/* Action buttons based on the active tab */}
        {activeTab === "writing" && (
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            className="flex-1 md:flex-none"
            onClick={handleManualEvaluation}
            disabled={evaluating}
          >
            {evaluating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            {getButtonLabel()}
          </Button>
        )}
        
        {["overview", "advanced"].includes(activeTab) && (
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            className="flex-1 md:flex-none"
            onClick={handleRegenerateInsightsWithFeedback} 
            disabled={generatingSummary || !assessmentData.writingScores || assessmentData.writingScores.length === 0}
          >
            {generatingSummary ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (assessmentData.analysisError && assessmentData.analysisError.toLowerCase().includes('rate limit')) ? (
              <>
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                Rate Limited
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {assessmentData.aiSummary ? "Regenerate Insights" : "Generate Insights"}
              </>
            )}
          </Button>
        )}
        
        {/* PDF Export Buttons */}
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "default"}
          className="flex-1 md:flex-none"
          onClick={exportCurrentView}
        >
          <FileText className="h-4 w-4 mr-2" />
          Export {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </Button>
        
        <Button 
          variant="default" 
          size={isMobile ? "sm" : "default"}
          className="flex-1 md:flex-none"
          onClick={exportFullReport}
        >
          <Download className="h-4 w-4 mr-2" />
          Full Report
        </Button>
      </div>
    </div>
  );
};

export default AssessmentHeader;
