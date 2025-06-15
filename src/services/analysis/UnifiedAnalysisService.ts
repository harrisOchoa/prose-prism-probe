
import { AIServiceManager } from "../ai/AIServiceManager";
import { AssessmentData } from "@/types/assessment";
import { updateAssessmentAnalysis } from "@/firebase/services/assessment";
import { AnalysisStatus } from "@/firebase/services/assessment/types";

export interface AnalysisProgress {
  status: 'pending' | 'writing_evaluated' | 'basic_insights_generated' | 'advanced_analysis_started' | 'completed' | 'failed' | 'rate_limited';
  completedSteps: string[];
  failedSteps: string[];
  error?: string;
}

export interface AnalysisRequest {
  assessmentId: string;
  assessmentData: AssessmentData;
  priority: 'high' | 'normal' | 'low';
  batchId?: string;
}

export class UnifiedAnalysisService {
  private aiService: AIServiceManager;
  private requestQueue: AnalysisRequest[] = [];
  private processingQueue = false;
  private analysisCache = new Map<string, any>();
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor() {
    this.aiService = new AIServiceManager();
  }

  async analyzeAssessment(request: AnalysisRequest): Promise<AnalysisProgress> {
    const { assessmentId, assessmentData } = request;
    
    console.log(`Starting unified analysis for assessment ${assessmentId}`);
    
    const progress: AnalysisProgress = {
      status: 'pending',
      completedSteps: [],
      failedSteps: []
    };

    try {
      await updateAssessmentAnalysis(assessmentId, {
        analysisStatus: 'pending' as AnalysisStatus
      });

      // Step 1: Evaluate writing with caching
      const writingData = await this.evaluateWritingWithCache(assessmentId, assessmentData, progress);
      if (!writingData) {
        throw new Error("Writing evaluation failed");
      }

      // Step 2: Generate basic insights with batching
      const insightsData = await this.generateBasicInsightsWithBatch(assessmentId, writingData, progress);
      if (!insightsData) {
        throw new Error("Basic insights generation failed");
      }

      // Step 3: Start advanced analysis (non-blocking with intelligent batching)
      this.generateAdvancedAnalysisBatched(assessmentId, insightsData, progress).catch(error => {
        console.error("Advanced analysis failed but continuing:", error);
      });

      progress.status = 'basic_insights_generated';
      await updateAssessmentAnalysis(assessmentId, {
        analysisStatus: progress.status
      });
      
      console.log(`Unified analysis completed successfully for ${assessmentId}`);
      return progress;
    } catch (error: any) {
      console.error(`Unified analysis failed for assessment ${assessmentId}:`, error);
      
      progress.status = 'failed';
      progress.error = error.message || "Unknown error in unified analysis";
      
      try {
        await updateAssessmentAnalysis(assessmentId, {
          analysisStatus: 'failed' as AnalysisStatus,
          analysisError: progress.error
        });
      } catch (updateError) {
        console.error("Failed to update analysis status:", updateError);
      }
      
      return progress;
    }
  }

  private async evaluateWritingWithCache(
    assessmentId: string,
    data: AssessmentData,
    progress: AnalysisProgress
  ): Promise<AssessmentData | null> {
    try {
      if (!data.completedPrompts || data.completedPrompts.length === 0) {
        throw new Error("No writing prompts to evaluate");
      }

      // Check cache first
      const cacheKey = `writing_${this.generateCacheKey(data.completedPrompts)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log("Using cached writing evaluation");
        progress.completedSteps.push('writing_evaluation_cached');
        return { ...data, ...cached };
      }

      console.log(`Evaluating writing for assessment ${assessmentId}`);
      const response = await this.aiService.evaluateWriting(data.completedPrompts);
      
      if (!response.data || response.data.length === 0) {
        throw new Error("No scores returned from writing evaluation");
      }

      const validScores = response.data.filter(score => score.score > 0);
      if (validScores.length === 0) {
        throw new Error("No valid scores generated from writing evaluation");
      }
      
      const overallScore = validScores.length > 0
        ? Number((validScores.reduce((sum, score) => sum + score.score, 0) / validScores.length).toFixed(1))
        : 0;

      const result = {
        writingScores: response.data,
        overallWritingScore: overallScore
      };

      // Cache the result
      this.setCache(cacheKey, result);
      
      await updateAssessmentAnalysis(assessmentId, {
        ...result,
        analysisStatus: 'writing_evaluated' as AnalysisStatus
      });
      
      progress.status = 'writing_evaluated';
      progress.completedSteps.push('writing_evaluation');
      
      return { ...data, ...result };
    } catch (error: any) {
      console.error(`Writing evaluation failed:`, error);
      progress.error = `Writing evaluation: ${error.message}`;
      progress.failedSteps.push('writing_evaluation');
      return null;
    }
  }

  private async generateBasicInsightsWithBatch(
    assessmentId: string,
    data: AssessmentData,
    progress: AnalysisProgress
  ): Promise<AssessmentData | null> {
    try {
      if (!data.writingScores || data.writingScores.length === 0) {
        throw new Error("No writing scores available for insights generation");
      }
      
      // Check cache
      const cacheKey = `insights_${assessmentId}_${data.overallWritingScore}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log("Using cached basic insights");
        progress.completedSteps.push('basic_insights_cached');
        return { ...data, ...cached };
      }

      console.log("Generating basic insights with batched requests...");
      
      // Batch both requests together for efficiency
      const [summaryResponse, analysisResponse] = await Promise.all([
        this.aiService.generateSummary(data),
        this.aiService.generateStrengthsWeaknesses(data)
      ]);
      
      if (!summaryResponse.data || !analysisResponse.data) {
        throw new Error("Failed to generate complete insights");
      }

      const result = {
        aiSummary: summaryResponse.data,
        strengths: analysisResponse.data.strengths,
        weaknesses: analysisResponse.data.weaknesses
      };

      // Cache the result
      this.setCache(cacheKey, result);
      
      await updateAssessmentAnalysis(assessmentId, result);
      
      progress.completedSteps.push('basic_insights');
      
      return { ...data, ...result };
    } catch (error: any) {
      console.error(`Basic insights generation failed:`, error);
      progress.error = `Basic insights: ${error.message}`;
      progress.failedSteps.push('basic_insights');
      return null;
    }
  }

  private async generateAdvancedAnalysisBatched(
    assessmentId: string,
    data: AssessmentData,
    progress: AnalysisProgress
  ): Promise<void> {
    try {
      console.log(`Starting batched advanced analysis for assessment ${assessmentId}`);
      
      await updateAssessmentAnalysis(assessmentId, {
        analysisStatus: 'advanced_analysis_started' as AnalysisStatus
      });
      
      progress.status = 'advanced_analysis_started';
      
      // Batch all advanced analysis requests for efficiency
      const analysisPromises = [];
      
      // Always include these core analyses
      analysisPromises.push(
        this.aiService.generateDetailedWritingAnalysis(data).then(response => ({
          key: 'detailedWritingAnalysis',
          name: 'writing_analysis',
          data: response.data
        })),
        this.aiService.generatePersonalityInsights(data).then(response => ({
          key: 'personalityInsights',
          name: 'personality_insights',
          data: response.data
        })),
        this.aiService.generateInterviewQuestions(data).then(response => ({
          key: 'interviewQuestions',
          name: 'interview_questions',
          data: response.data
        })),
        this.aiService.generateProfileMatch(data).then(response => ({
          key: 'profileMatch',
          name: 'profile_match',
          data: response.data
        }))
      );
      
      // Add aptitude analysis if applicable
      if (data.aptitudeScore !== undefined) {
        analysisPromises.push(
          this.aiService.generateAptitudeAnalysis(data).then(response => ({
            key: 'aptitudeAnalysis',
            name: 'aptitude_analysis',
            data: response.data
          }))
        );
      }
      
      // Execute all analyses in parallel with proper error handling
      const results = await Promise.allSettled(analysisPromises);
      const updateData: any = {};
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.data) {
          updateData[result.value.key] = result.value.data;
          progress.completedSteps.push(result.value.name);
          console.log(`${result.value.name} completed successfully`);
        } else {
          const analysisName = analysisPromises[index] ? 'advanced_analysis_item' : 'unknown';
          progress.failedSteps.push(analysisName);
          console.error(`Analysis failed:`, result.status === 'rejected' ? result.reason : 'Unknown error');
        }
      });
      
      // Batch update all results at once
      if (Object.keys(updateData).length > 0) {
        await updateAssessmentAnalysis(assessmentId, {
          ...updateData,
          analysisStatus: 'completed' as AnalysisStatus
        });
      }
      
      progress.status = 'completed';
      console.log(`Batched advanced analysis completed for assessment ${assessmentId}`);
      
    } catch (error) {
      console.error(`Advanced analysis process failed:`, error);
      progress.failedSteps.push('advanced_analysis_batch');
    }
  }

  private generateCacheKey(data: any): string {
    return btoa(JSON.stringify(data)).substring(0, 16);
  }

  private getFromCache(key: string): any {
    const cached = this.analysisCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.analysisCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getHealthStatus() {
    return this.aiService.getHealthStatus();
  }
}

// Export singleton instance
export const unifiedAnalysisService = new UnifiedAnalysisService();
