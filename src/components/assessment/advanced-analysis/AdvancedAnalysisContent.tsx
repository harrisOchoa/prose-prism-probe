
import React, { useState, useEffect, useMemo } from "react";
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
  const [key, setKey] = useState<string>(Date.now().toString());
  
  // Extract analysis data from assessmentData using useMemo for better performance
  const detailedAnalysis = useMemo(() => assessmentData.detailedWritingAnalysis, [assessmentData.detailedWritingAnalysis]);
  const personalityInsights = useMemo(() => assessmentData.personalityInsights, [assessmentData.personalityInsights]);
  const interviewQuestions = useMemo(() => assessmentData.interviewQuestions, [assessmentData.interviewQuestions]);
  const profileMatch = useMemo(() => assessmentData.profileMatch, [assessmentData.profileMatch]);
  const aptitudeAnalysis = useMemo(() => assessmentData.aptitudeAnalysis, [assessmentData.aptitudeAnalysis]);

  // Debug logs to help track state updates
  useEffect(() => {
    console.log("AdvancedAnalysisContent received assessmentData:", {
      id: assessmentData.id,
      hasDetailedAnalysis: !!detailedAnalysis,
      hasPersonalityInsights: !!personalityInsights,
      hasInterviewQuestions: !!interviewQuestions,
      hasProfileMatch: !!profileMatch,
      hasAptitudeAnalysis: !!aptitudeAnalysis
    });
    
    // Force re-render of components
    setKey(Date.now().toString());
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
      
      console.log("Updated loading states:", generatingAnalysis);
    }
  }, [generatingAnalysis]);

  const handleGenerateAnalysis = async (analysisType: string) => {
    // Set loading state immediately
    setLoading(prev => ({...prev, [analysisType]: true}));
    
    try {
      console.log(`Starting generation of ${analysisType} analysis...`);
      
      // Call the parent's generateAdvancedAnalysis function
      const result = await generateAdvancedAnalysis(analysisType);
      
      console.log(`Analysis generation complete for ${analysisType}:`, result);
      
      if (!result) {
        console.error(`No result returned for ${analysisType} analysis`);
      } else {
        // Force UI refresh
        setKey(Date.now().toString());
      }
      
      return result;
    } catch (error) {
      console.error(`Error in handleGenerateAnalysis for ${analysisType}:`, error);
      toast({
        title: "Analysis Failed",
        description: `Failed to generate ${analysisType} analysis. Please try again.`,
        variant: "destructive"
      });
      return null;
    } finally {
      // Reset loading state
      setLoading(prev => ({...prev, [analysisType]: false}));
    }
  };

  // Get button label for each analysis type
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
    <div key={key} className="space-y-6">
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

export default React.memo(AdvancedAnalysisContent);
