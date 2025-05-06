
import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import AnalysisTabs from "./AnalysisTabs";
import { getConfidenceBadgeColor, getCategoryBadgeColor, getAnalysisButtonLabel } from "./utils";
import { 
  PersonalityInsight, 
  InterviewQuestion, 
  DetailedAnalysis,
  CandidateProfileMatch,
  AptitudeAnalysis
} from "@/services/geminiService";

interface AdvancedAnalysisContentProps {
  assessmentData: any;
  getProgressColor: (value: number) => string;
  generateAdvancedAnalysis: (analysisType: string) => Promise<any>;
  generatingAnalysis: {[key: string]: boolean};
}

const AdvancedAnalysisContent: React.FC<AdvancedAnalysisContentProps> = ({
  assessmentData,
  getProgressColor,
  generateAdvancedAnalysis,
  generatingAnalysis = {}
}) => {
  const [loading, setLoading] = useState<{[key: string]: boolean}>({
    writing: false,
    personality: false,
    questions: false,
    profile: false,
    aptitude: false
  });
  
  // Use state from assessmentData directly instead of separate state
  // This ensures we always display what's in the parent state
  const detailedAnalysis = assessmentData.detailedWritingAnalysis;
  const personalityInsights = assessmentData.personalityInsights;
  const interviewQuestions = assessmentData.interviewQuestions;
  const profileMatch = assessmentData.profileMatch;
  const aptitudeAnalysis = assessmentData.aptitudeAnalysis;

  // Debug logs to help track state updates
  useEffect(() => {
    console.log("AdvancedAnalysisContent received updated assessmentData:", {
      hasDetailedAnalysis: !!detailedAnalysis,
      hasPersonalityInsights: !!personalityInsights,
      hasInterviewQuestions: !!interviewQuestions,
      hasProfileMatch: !!profileMatch,
      hasAptitudeAnalysis: !!aptitudeAnalysis
    });
  }, [assessmentData, detailedAnalysis, personalityInsights, interviewQuestions, profileMatch, aptitudeAnalysis]);

  // Update loading state based on generatingAnalysis prop
  useEffect(() => {
    if (generatingAnalysis) {
      setLoading({
        writing: generatingAnalysis.writing || generatingAnalysis.detailed || false,
        personality: generatingAnalysis.personality || false,
        questions: generatingAnalysis.interview || generatingAnalysis.questions || false,
        profile: generatingAnalysis.profile || false,
        aptitude: generatingAnalysis.aptitude || false
      });
    }
  }, [generatingAnalysis]);

  const handleGenerateAnalysis = async (analysisType: string) => {
    if (!assessmentData.overallWritingScore && analysisType !== 'aptitude') {
      toast({
        title: "Writing Not Evaluated",
        description: "Please evaluate the writing first to generate advanced analysis.",
        variant: "destructive"
      });
      return;
    }
    
    if (analysisType === 'aptitude' && !assessmentData.aptitudeScore) {
      toast({
        title: "Aptitude Results Needed",
        description: "This candidate needs to complete the aptitude test before analysis.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Set local loading state
      setLoading(prev => ({...prev, [analysisType]: true}));
      
      console.log(`Starting generation of ${analysisType} analysis...`);
      
      // Call the parent's generateAdvancedAnalysis function
      const result = await generateAdvancedAnalysis(analysisType);
      
      console.log(`Analysis generation complete for ${analysisType}:`, result);
      
      if (!result) {
        console.error(`No result returned for ${analysisType} analysis`);
        toast({
          title: "Analysis Failed",
          description: `Failed to generate ${analysisType} analysis. Please try again.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(`Error in handleGenerateAnalysis for ${analysisType}:`, error);
    } finally {
      // Reset loading state after a short delay to ensure UI updates properly
      setTimeout(() => {
        setLoading(prev => ({...prev, [analysisType]: false}));
      }, 500);
    }
  };

  // Create a wrapper function that matches the expected signature in AnalysisTabs
  const getButtonLabel = (type: string) => {
    const exists = getExistingAnalysisState(type);
    return getAnalysisButtonLabel(type, exists);
  };

  // Helper function to determine if analysis data exists for a specific type
  const getExistingAnalysisState = (type: string): boolean => {
    switch (type) {
      case "writing": return !!detailedAnalysis;
      case "personality": return !!personalityInsights;
      case "questions": return !!interviewQuestions;
      case "profile": return !!profileMatch;
      case "aptitude": return !!aptitudeAnalysis;
      default: return false;
    }
  };

  return (
    <div className="space-y-6">
      <AnalysisTabs 
        assessmentData={assessmentData}
        loading={loading}
        handleGenerateAnalysis={handleGenerateAnalysis}
        getAnalysisButtonLabel={getButtonLabel}
        getProgressColor={getProgressColor}
        getConfidenceBadgeColor={getConfidenceBadgeColor}
        getCategoryBadgeColor={getCategoryBadgeColor}
        detailedAnalysis={detailedAnalysis}
        personalityInsights={personalityInsights}
        interviewQuestions={interviewQuestions}
        profileMatch={profileMatch}
        aptitudeAnalysis={aptitudeAnalysis}
      />
    </div>
  );
};

export default AdvancedAnalysisContent;
