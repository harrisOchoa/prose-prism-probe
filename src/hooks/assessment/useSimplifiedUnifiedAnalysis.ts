
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useAnalysisStateManager } from "./useAnalysisStateManager";
import { AssessmentData } from "@/types/assessment";
import { analysisLoopPrevention } from "@/services/analysis/AnalysisLoopPrevention";
import { evaluateAllWritingPrompts, generateCandidateSummary, generateStrengthsAndWeaknesses } from "@/services/geminiService";
import { updateAssessmentAnalysis } from "@/firebase/assessmentService";

export const useSimplifiedUnifiedAnalysis = (assessmentId?: string) => {
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  
  // Use the state manager with the assessment ID
  const stateManager = useAnalysisStateManager(assessmentId);

  const startAnalysis = async (
    id: string, 
    assessmentData: AssessmentData
  ): Promise<boolean> => {
    console.log('Starting simplified unified analysis for:', id);
    
    if (!id || !assessmentData) {
      console.error('Missing assessment ID or data');
      return false;
    }
    
    // Check if analysis can start
    if (!stateManager.canStartAnalysis) {
      console.log('Cannot start analysis - state manager blocked it');
      return false;
    }

    // Start analysis with loop prevention
    if (!stateManager.startAnalysis(id)) {
      console.log('Cannot start analysis - already in progress');
      return false;
    }
    
    try {
      setAnalysisInProgress(true);
      
      console.log('Phase 1: Evaluating writing responses');
      stateManager.setState?.('evaluating');
      
      // Step 1: Evaluate writing if not already done
      let updatedData = { ...assessmentData };
      if (!assessmentData.writingScores || assessmentData.writingScores.length === 0) {
        if (!assessmentData.completedPrompts || assessmentData.completedPrompts.length === 0) {
          throw new Error("No writing prompts to evaluate");
        }
        
        const scores = await analysisLoopPrevention.withTimeout(
          () => evaluateAllWritingPrompts(assessmentData.completedPrompts),
          30000
        );
        
        if (!scores || scores.length === 0) {
          throw new Error("Failed to evaluate writing responses");
        }
        
        const validScores = scores.filter(score => score.score > 0);
        const overallScore = validScores.length > 0
          ? Number((validScores.reduce((sum, score) => sum + score.score, 0) / validScores.length).toFixed(1))
          : 0;
        
        updatedData = {
          ...updatedData,
          writingScores: scores,
          overallWritingScore: overallScore
        };
        
        // Save writing scores
        await updateAssessmentAnalysis(id, {
          writingScores: scores,
          overallWritingScore: overallScore
        });
        
        console.log('Writing evaluation completed');
      }
      
      console.log('Phase 2: Generating insights');
      stateManager.setState?.('generating_summary');
      
      // Step 2: Generate insights
      const [summary, analysis] = await Promise.all([
        analysisLoopPrevention.withTimeout(
          () => generateCandidateSummary(updatedData),
          30000
        ),
        analysisLoopPrevention.withTimeout(
          () => generateStrengthsAndWeaknesses(updatedData),
          30000
        )
      ]);
      
      if (!summary || !analysis) {
        throw new Error("Failed to generate insights");
      }
      
      // Save insights
      await updateAssessmentAnalysis(id, {
        aiSummary: summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        analysisStatus: 'basic_insights_generated'
      });
      
      console.log('Insights generation completed');
      stateManager.completeAnalysis(id);
      
      return true;
      
    } catch (error: any) {
      console.error('Unified analysis failed:', error);
      stateManager.failAnalysis(id, error.message);
      return false;
    } finally {
      setAnalysisInProgress(false);
    }
  };

  const generateInsightsOnly = async (
    id: string,
    assessmentData: AssessmentData
  ): Promise<boolean> => {
    console.log('Generating insights only for:', id);
    
    if (!assessmentData.writingScores || assessmentData.writingScores.length === 0) {
      toast({
        title: "No Writing Scores",
        description: "Please evaluate the writing first to generate insights.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!stateManager.startAnalysis(id)) {
      return false;
    }
    
    try {
      setAnalysisInProgress(true);
      
      toast({
        title: "Generating Insights",
        description: "Creating summary and analysis...",
      });

      const [summary, analysis] = await Promise.all([
        analysisLoopPrevention.withTimeout(
          () => generateCandidateSummary(assessmentData),
          30000
        ),
        analysisLoopPrevention.withTimeout(
          () => generateStrengthsAndWeaknesses(assessmentData),
          30000
        )
      ]);
      
      if (!summary || !analysis) {
        throw new Error("Failed to generate insights");
      }
      
      await updateAssessmentAnalysis(id, {
        aiSummary: summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        analysisStatus: 'basic_insights_generated'
      });
      
      stateManager.completeAnalysis(id);
      
      toast({
        title: "Insights Generated",
        description: "Assessment insights have been successfully generated.",
      });
      
      return true;
    } catch (error: any) {
      stateManager.failAnalysis(id, error.message);
      return false;
    } finally {
      setAnalysisInProgress(false);
    }
  };

  return {
    // State
    analysisInProgress,
    analysisState: stateManager.state,
    canStartAnalysis: stateManager.canStartAnalysis,
    
    // Actions
    startAnalysis,
    generateInsightsOnly,
    resetAnalysisState: stateManager.resetState,
    
    // Status
    getStatusMessage: stateManager.getStatusMessage,
    
    // Backward compatibility
    evaluating: stateManager.state === 'evaluating',
    generatingSummary: stateManager.state === 'generating_summary'
  };
};
