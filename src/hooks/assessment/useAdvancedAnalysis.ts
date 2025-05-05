
import { useState } from "react";
import { 
  generateDetailedWritingAnalysis,
  generatePersonalityInsights,
  generateInterviewQuestions,
  compareWithIdealProfile,
  generateAptitudeAnalysis
} from "@/services/geminiService";
import { updateAssessmentAnalysis } from "@/firebase/assessmentService";
import { toast } from "@/hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { AssessmentData } from "@/types/assessment";

export const useAdvancedAnalysis = (assessmentData: AssessmentData, setAssessmentData: (data: AssessmentData) => void) => {
  const [generatingAnalysis, setGeneratingAnalysis] = useState<Record<string, boolean>>({});

  /**
   * Generate advanced analysis based on type
   */
  const generateAdvancedAnalysis = async (type: string): Promise<any> => {
    if (!assessmentData || !assessmentData.writingScores || assessmentData.writingScores.length === 0) {
      toast({
        title: "Writing Evaluation Required",
        description: "Writing must be evaluated before generating analysis.",
        variant: "destructive",
      });
      return Promise.reject(new Error("Writing evaluation required"));
    }

    const analysisType = type.toLowerCase();
    setGeneratingAnalysis(prev => ({ ...prev, [analysisType]: true }));

    try {
      let result;
      let updateField;
      
      switch (analysisType) {
        case 'writing':
        case 'detailed':  // Add 'detailed' as an alias for 'writing'
          result = await generateDetailedWritingAnalysis(assessmentData);
          updateField = 'detailedWritingAnalysis';
          break;
        case 'personality':
          result = await generatePersonalityInsights(assessmentData);
          updateField = 'personalityInsights';
          break;
        case 'interview':
        case 'questions': // Add 'questions' as an alias for 'interview'
          result = await generateInterviewQuestions(assessmentData);
          updateField = 'interviewQuestions';
          break;
        case 'profile':
          result = await compareWithIdealProfile(assessmentData);
          updateField = 'profileMatch';
          break;
        case 'aptitude':
          result = await generateAptitudeAnalysis(assessmentData);
          updateField = 'aptitudeAnalysis';
          break;
        default:
          throw new Error(`Unknown analysis type: ${type}`);
      }
      
      // Update assessment data state
      const updatedData = { ...assessmentData, [updateField]: result };
      setAssessmentData(updatedData);
      
      // Update in database with verification
      try {
        await updateAssessmentAnalysis(assessmentData.id, { [updateField]: result });
        
        // Verify that data was saved properly
        const assessmentRef = doc(db, "assessments", assessmentData.id);
        const refreshedDoc = await getDoc(assessmentRef);
        
        if (refreshedDoc.exists()) {
          const savedData = refreshedDoc.data();
          if (!savedData[updateField] || 
              JSON.stringify(savedData[updateField]) !== JSON.stringify(result)) {
            console.error(`Database verification failed for ${updateField}`);
            throw new Error("Failed to verify data was saved correctly");
          }
          console.log(`${updateField} verified as saved successfully`);
        }
      } catch (dbError) {
        console.error(`Error saving ${updateField} to database:`, dbError);
        toast({
          title: "Save Error",
          description: `Generated analysis could not be saved. Please try again.`,
          variant: "destructive",
        });
        throw dbError;
      }
      
      toast({
        title: "Analysis Complete",
        description: `${type} analysis has been generated and saved successfully.`,
      });
      
      return result;
    } catch (error) {
      console.error(`Error generating ${type} analysis:`, error);
      toast({
        title: "Analysis Failed",
        description: `Could not generate ${type} analysis. ${error.message}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setGeneratingAnalysis(prev => ({ ...prev, [analysisType]: false }));
    }
  };

  return {
    generatingAnalysis,
    generateAdvancedAnalysis
  };
};
