
import { logger } from '../logging';
import { aiServiceManager } from '../ai/AIServiceManager';
import { performanceMonitor } from '../monitoring/PerformanceMonitor';

export interface ProgressiveAnalysisResult {
  status: 'in_progress' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  completedSteps: string[];
  results: {
    writingScores?: any[];
    candidateInsights?: any;
    advancedAnalysis?: any;
    overallWritingScore?: number;
  };
  error?: string;
  timestamp: number;
}

export interface AnalysisConfig {
  timeoutMs: number;
  enableParallelProcessing: boolean;
  enableProgressiveResults: boolean;
  maxRetries: number;
}

class PerformanceOptimizedAnalysisService {
  private readonly DEFAULT_CONFIG: AnalysisConfig = {
    timeoutMs: 30000, // 30 seconds per step
    enableParallelProcessing: true,
    enableProgressiveResults: true,
    maxRetries: 2
  };

  private activeAnalyses = new Map<string, Promise<ProgressiveAnalysisResult>>();

  async analyzeWithProgress(
    assessmentId: string,
    assessmentData: any,
    onProgress?: (result: ProgressiveAnalysisResult) => void,
    config: Partial<AnalysisConfig> = {}
  ): Promise<ProgressiveAnalysisResult> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    // Prevent duplicate analysis requests
    if (this.activeAnalyses.has(assessmentId)) {
      logger.info('ANALYSIS', 'Analysis already in progress, returning existing promise', { assessmentId });
      return this.activeAnalyses.get(assessmentId)!;
    }

    const analysisPromise = this.performProgressiveAnalysis(
      assessmentId,
      assessmentData,
      onProgress,
      finalConfig
    );

    this.activeAnalyses.set(assessmentId, analysisPromise);
    
    try {
      const result = await analysisPromise;
      return result;
    } finally {
      this.activeAnalyses.delete(assessmentId);
    }
  }

  private async performProgressiveAnalysis(
    assessmentId: string,
    assessmentData: any,
    onProgress?: (result: ProgressiveAnalysisResult) => void,
    config: AnalysisConfig = this.DEFAULT_CONFIG
  ): Promise<ProgressiveAnalysisResult> {
    const timerName = `progressive_analysis_${assessmentId}`;
    performanceMonitor.startTimer(timerName, { assessmentId });

    const result: ProgressiveAnalysisResult = {
      status: 'in_progress',
      progress: 0,
      currentStep: 'Initializing',
      completedSteps: [],
      results: {},
      timestamp: Date.now()
    };

    const updateProgress = (step: string, progress: number, stepResults?: any) => {
      result.currentStep = step;
      result.progress = progress;
      result.timestamp = Date.now();
      
      if (stepResults) {
        result.results = { ...result.results, ...stepResults };
      }
      
      if (onProgress) {
        onProgress({ ...result });
      }
    };

    try {
      logger.analysisStart(assessmentId, 'performance_optimized');
      
      // Check AI service health first
      updateProgress('Checking AI service health', 10);
      const healthStatus = aiServiceManager.getHealthStatus();
      const isHealthy = Object.values(healthStatus).some(status => status === true);
      
      if (!isHealthy) {
        throw new Error('AI services are currently unavailable');
      }

      const analysisSteps: Array<() => Promise<any>> = [];

      // Step 1: Writing evaluation (if needed)
      if (assessmentData.completedPrompts?.length > 0) {
        analysisSteps.push(async () => {
          updateProgress('Evaluating writing responses', 30);
          const writingScores = await this.evaluateWritingWithTimeout(
            assessmentData.completedPrompts,
            config.timeoutMs
          );
          const overallWritingScore = this.calculateOverallScore(writingScores);
          
          result.completedSteps.push('writing_evaluation');
          return { writingScores, overallWritingScore };
        });
      }

      // Step 2: Generate insights
      analysisSteps.push(async () => {
        updateProgress('Generating candidate insights', 60);
        const candidateInsights = await this.generateInsightsWithTimeout(
          assessmentData,
          config.timeoutMs
        );
        
        result.completedSteps.push('insights_generation');
        return { candidateInsights };
      });

      // Step 3: Advanced analysis (optional, low priority)
      analysisSteps.push(async () => {
        updateProgress('Performing advanced analysis', 80);
        try {
          const advancedAnalysis = await this.generateAdvancedAnalysisWithTimeout(
            assessmentData,
            config.timeoutMs / 2 // Shorter timeout for advanced analysis
          );
          
          result.completedSteps.push('advanced_analysis');
          return { advancedAnalysis };
        } catch (error) {
          logger.warn('ANALYSIS', 'Advanced analysis failed, continuing with basic results', error);
          return {}; // Don't fail the entire analysis for advanced features
        }
      });

      // Execute analysis steps
      if (config.enableParallelProcessing && analysisSteps.length > 1) {
        // Run steps in parallel where possible
        const [writingResults, insightsResults] = await Promise.allSettled([
          analysisSteps[0]?.(),
          analysisSteps[1]?.()
        ]);

        if (writingResults.status === 'fulfilled') {
          updateProgress('Writing evaluation completed', 40, writingResults.value);
        }
        
        if (insightsResults.status === 'fulfilled') {
          updateProgress('Insights generation completed', 70, insightsResults.value);
        }

        // Run advanced analysis separately (non-blocking)
        if (analysisSteps[2]) {
          analysisSteps[2]().then(advancedResults => {
            updateProgress('Advanced analysis completed', 90, advancedResults);
          }).catch(() => {
            // Advanced analysis failure is non-critical
          });
        }
      } else {
        // Sequential execution
        for (let i = 0; i < analysisSteps.length; i++) {
          try {
            const stepResults = await analysisSteps[i]();
            const progressPercent = 30 + (i + 1) * (60 / analysisSteps.length);
            updateProgress(`Step ${i + 1} completed`, progressPercent, stepResults);
          } catch (error) {
            if (i < 2) { // Critical steps (writing, insights)
              throw error;
            }
            // Advanced analysis failure is non-critical
            logger.warn('ANALYSIS', `Non-critical step ${i + 1} failed`, error);
          }
        }
      }

      result.status = 'completed';
      result.progress = 100;
      result.currentStep = 'Analysis completed';
      
      const duration = performanceMonitor.endTimer(timerName);
      logger.analysisComplete(assessmentId, 'performance_optimized', duration || 0);
      
      return result;

    } catch (error: any) {
      result.status = 'failed';
      result.error = error.message;
      result.currentStep = 'Analysis failed';
      
      logger.analysisError(assessmentId, 'performance_optimized', error);
      performanceMonitor.endTimer(timerName);
      
      return result;
    }
  }

  private async evaluateWritingWithTimeout(prompts: any[], timeoutMs: number): Promise<any[]> {
    return this.withTimeout(
      async () => {
        const response = await aiServiceManager.evaluateWriting(prompts);
        if (!response.success || !response.data) {
          throw new Error(`Writing evaluation failed: ${response.error}`);
        }
        return response.data;
      },
      timeoutMs,
      'Writing evaluation timed out'
    );
  }

  private async generateInsightsWithTimeout(assessmentData: any, timeoutMs: number): Promise<any> {
    return this.withTimeout(
      async () => {
        const response = await aiServiceManager.generateSummary(assessmentData);
        if (!response.success || !response.data) {
          throw new Error(`Insights generation failed: ${response.error}`);
        }
        return response.data;
      },
      timeoutMs,
      'Insights generation timed out'
    );
  }

  private async generateAdvancedAnalysisWithTimeout(assessmentData: any, timeoutMs: number): Promise<any> {
    return this.withTimeout(
      async () => {
        const [strengthsWeaknesses, writingAnalysis] = await Promise.allSettled([
          aiServiceManager.generateStrengthsWeaknesses(assessmentData),
          aiServiceManager.generateDetailedWritingAnalysis(assessmentData)
        ]);

        const analysis: any = {};
        
        if (strengthsWeaknesses.status === 'fulfilled' && strengthsWeaknesses.value.success) {
          analysis.strengthsWeaknesses = strengthsWeaknesses.value.data;
        }
        
        if (writingAnalysis.status === 'fulfilled' && writingAnalysis.value.success) {
          analysis.writingAnalysis = writingAnalysis.value.data;
        }

        return analysis;
      },
      timeoutMs,
      'Advanced analysis timed out'
    );
  }

  private async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    timeoutMessage: string
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    });

    return Promise.race([operation(), timeoutPromise]);
  }

  private calculateOverallScore(scores: any[]): number {
    if (!scores || scores.length === 0) return 0;
    
    const validScores = scores.filter(score => score.score > 0);
    if (validScores.length === 0) return 0;
    
    const average = validScores.reduce((sum, score) => sum + score.score, 0) / validScores.length;
    return Number(average.toFixed(1));
  }

  clearActiveAnalyses(): void {
    this.activeAnalyses.clear();
  }

  getActiveAnalysesCount(): number {
    return this.activeAnalyses.size;
  }
}

export const performanceOptimizedAnalysisService = new PerformanceOptimizedAnalysisService();
