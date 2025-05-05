
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
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

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
  const [detailedAnalysis, setDetailedAnalysis] = useState<DetailedAnalysis | null>(null);
  const [personalityInsights, setPersonalityInsights] = useState<PersonalityInsight[] | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[] | null>(null);
  const [profileMatch, setProfileMatch] = useState<CandidateProfileMatch | null>(null);
  const [aptitudeAnalysis, setAptitudeAnalysis] = useState<AptitudeAnalysis | null>(null);

  // Initial load and refresh from database
  useEffect(() => {
    const refreshDataFromFirestore = async () => {
      if (assessmentData && assessmentData.id) {
        try {
          const assessmentRef = doc(db, "assessments", assessmentData.id);
          const docSnap = await getDoc(assessmentRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Update local state with data from Firestore
            if (data.detailedWritingAnalysis) setDetailedAnalysis(data.detailedWritingAnalysis);
            if (data.personalityInsights) setPersonalityInsights(data.personalityInsights);
            if (data.interviewQuestions) setInterviewQuestions(data.interviewQuestions);
            if (data.profileMatch) setProfileMatch(data.profileMatch);
            if (data.aptitudeAnalysis) setAptitudeAnalysis(data.aptitudeAnalysis);
            
            console.log("Advanced analysis data refreshed from Firestore");
          }
        } catch (error) {
          console.error("Error refreshing data from Firestore:", error);
        }
      }
    };
    
    // Always try to get fresh data from Firestore when component mounts or assessment changes
    refreshDataFromFirestore();
    
    // Also update from props (though this might be stale)
    if (assessmentData) {
      if (assessmentData.detailedWritingAnalysis) {
        setDetailedAnalysis(assessmentData.detailedWritingAnalysis);
      }
      if (assessmentData.personalityInsights) {
        setPersonalityInsights(assessmentData.personalityInsights);
      }
      if (assessmentData.interviewQuestions) {
        setInterviewQuestions(assessmentData.interviewQuestions);
      }
      if (assessmentData.profileMatch) {
        setProfileMatch(assessmentData.profileMatch);
      }
      if (assessmentData.aptitudeAnalysis) {
        setAptitudeAnalysis(assessmentData.aptitudeAnalysis);
      }
    }
  }, [assessmentData?.id]);

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
    if (!assessmentData.overallWritingScore) {
      toast({
        title: "Writing Not Evaluated",
        description: "Please evaluate the writing first to generate advanced analysis.",
        variant: "destructive"
      });
      return;
    }

    try {
      let result;
      switch(analysisType) {
        case "writing":
          result = await generateAdvancedAnalysis("writing");
          if (result) setDetailedAnalysis(result);
          break;
        case "personality":
          result = await generateAdvancedAnalysis("personality");
          if (result) setPersonalityInsights(result);
          break;
        case "questions":
          result = await generateAdvancedAnalysis("interview");
          if (result) setInterviewQuestions(result);
          break;
        case "profile":
          result = await generateAdvancedAnalysis("profile");
          if (result) setProfileMatch(result);
          break;
        case "aptitude":
          result = await generateAdvancedAnalysis("aptitude");
          if (result) setAptitudeAnalysis(result);
          break;
      }
    } catch (error) {
      console.error(`Error in handleGenerateAnalysis for ${analysisType}:`, error);
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
