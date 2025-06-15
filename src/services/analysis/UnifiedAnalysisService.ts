
import { logger } from '../logging';
import { aiServiceManager } from '../ai/AIServiceManager';
import { requestDeduplicator } from './RequestDeduplicator';
import { performanceMonitor } from '../monitoring/PerformanceMonitor';

export type AIServiceHealth = {
  isHealthy: boolean;
  issues: string[];
};

export type CacheStats = {
  size: number;
};

export type QueueStats = {
  size: number;
};

export type HealthStatus = {
  isHealthy: boolean;
  services: AIServiceHealth;
  cache: CacheStats;
  queue: QueueStats;
};

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type AnalysisPriority = 'low' | 'normal' | 'high';

export interface AnalysisRequest {
  assessmentId: string;
  assessmentData: any;
  priority: AnalysisPriority;
  requestId?: string;
}

export interface AnalysisProgress {
  status: AnalysisStatus;
  currentStep?: string;
  progress?: number;
  results?: any;
  error?: string;
  requestId: string;
}

/**
 * Unified Analysis Service - Centralized analysis system with performance optimizations
 */
class UnifiedAnalysisService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private processingQueue = new Map<string, Promise<AnalysisProgress>>();
  
  constructor() {
    logger.info('SYSTEM', 'UnifiedAnalysisService initialized');
  }

  /**
   * Main analysis entry point with request deduplication and caching
   */
  async analyzeAssessment(request: AnalysisRequest): Promise<AnalysisProgress> {
    const requestId = request.requestId || `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const cacheKey = `${request.assessmentId}_${JSON.stringify(request.assessmentData).slice(0, 100)}`;
    
    logger.analysisStart(request.assessmentId, 'unified');
    performanceMonitor.startTimer(`analysis_${requestId}`);

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      logger.info('ANALYSIS', 'Returning cached analysis result', { assessmentId: request.assessmentId });
      return {
        status: 'completed',
        results: cached,
        requestId
      };
    }

    // Deduplicate requests
    const deduplicatedRequest = await requestDeduplicator.deduplicate(
      cacheKey,
      () => this.performAnalysis({ ...request, requestId })
    );

    return deduplicatedRequest;
  }

  private async performAnalysis(request: AnalysisRequest): Promise<AnalysisProgress> {
    const { assessmentId, assessmentData, priority, requestId } = request;
    
    try {
      // Check if we have valid assessment data
      if (!assessmentData || !assessmentId) {
        throw new Error('Invalid assessment data provided');
      }

      logger.info('ANALYSIS', 'Processing analysis request', { 
        assessmentId, 
        priority,
        hasWritingPrompts: !!assessmentData.completedPrompts?.length,
        hasAptitudeResults: !!assessmentData.aptitudeResults?.categories
      });

      const results: any = {};
      let currentStep = '';
      
      // Step 1: Evaluate writing if available
      if (assessmentData.completedPrompts?.length > 0) {
        currentStep = 'Evaluating writing responses';
        logger.info('ANALYSIS', currentStep, { promptCount: assessmentData.completedPrompts.length });
        
        const writingResponse = await this.evaluateWriting(assessmentData.completedPrompts);
        results.writingScores = writingResponse;
        results.overallWritingScore = this.calculateOverallScore(writingResponse);
      }

      // Step 2: Generate insights
      currentStep = 'Generating insights';
      logger.info('ANALYSIS', currentStep);
      
      const insights = await this.generateInsights(assessmentData, results);
      results.candidateInsights = insights;

      // Step 3: Advanced analysis if requested
      if (priority === 'high') {
        currentStep = 'Performing advanced analysis';
        logger.info('ANALYSIS', currentStep);
        
        const advancedAnalysis = await this.generateAdvancedAnalysis(assessmentData, results);
        results.advancedAnalysis = advancedAnalysis;
      }

      // Cache successful results
      const cacheKey = `${assessmentId}_${JSON.stringify(assessmentData).slice(0, 100)}`;
      this.setCache(cacheKey, results, 300000); // 5 minutes TTL

      const duration = performanceMonitor.endTimer(`analysis_${requestId!}`);
      logger.analysisComplete(assessmentId, 'unified', duration || 0);

      return {
        status: 'completed',
        results,
        requestId: requestId!
      };

    } catch (error: any) {
      logger.analysisError(assessmentId, 'unified', error);
      performanceMonitor.endTimer(`analysis_${requestId!}`);
      
      return {
        status: 'failed',
        error: error.message,
        requestId: requestId!
      };
    }
  }

  private async evaluateWriting(prompts: any[]): Promise<any[]> {
    try {
      logger.debug('ANALYSIS', 'Starting writing evaluation', { promptCount: prompts.length });
      
      const healthStatus = aiServiceManager.getHealthStatus();
      const isHealthy = Object.values(healthStatus).some(status => status === true);
      if (!isHealthy) {
        const issues = Object.entries(healthStatus)
          .filter(([_, status]) => !status)
          .map(([name, _]) => `${name} unavailable`);
        throw new Error(`AI service not available: ${issues.join(', ')}`);
      }

      const response = await aiServiceManager.evaluateWriting(prompts);
      if (!response.success || !response.data) {
        throw new Error(`Writing evaluation failed: ${response.error || 'Unknown error'}`);
      }
      
      logger.debug('ANALYSIS', 'Writing evaluation completed', { resultCount: response.data.length });
      
      return response.data;
    } catch (error: any) {
      logger.error('ANALYSIS', 'Writing evaluation failed', error);
      throw error;
    }
  }

  private async generateInsights(assessmentData: any, analysisResults: any): Promise<any> {
    try {
      logger.debug('ANALYSIS', 'Generating candidate insights');
      
      const response = await aiServiceManager.generateSummary(assessmentData);
      if (!response.success || !response.data) {
        throw new Error(`Insights generation failed: ${response.error || 'Unknown error'}`);
      }
      
      logger.debug('ANALYSIS', 'Insights generation completed');
      
      return response.data;
    } catch (error: any) {
      logger.error('ANALYSIS', 'Insights generation failed', error);
      throw error;
    }
  }

  private async generateAdvancedAnalysis(assessmentData: any, basicResults: any): Promise<any> {
    try {
      logger.debug('ANALYSIS', 'Generating advanced analysis');
      
      // Generate multiple types of advanced analysis
      const [
        strengthsWeaknesses,
        writingAnalysis,
        personalityInsights
      ] = await Promise.allSettled([
        aiServiceManager.generateStrengthsWeaknesses(assessmentData),
        aiServiceManager.generateDetailedWritingAnalysis(assessmentData),
        aiServiceManager.generatePersonalityInsights(assessmentData)
      ]);

      const analysis: any = {};

      if (strengthsWeaknesses.status === 'fulfilled' && strengthsWeaknesses.value.success) {
        analysis.strengthsWeaknesses = strengthsWeaknesses.value.data;
      }

      if (writingAnalysis.status === 'fulfilled' && writingAnalysis.value.success) {
        analysis.writingAnalysis = writingAnalysis.value.data;
      }

      if (personalityInsights.status === 'fulfilled' && personalityInsights.value.success) {
        analysis.personalityInsights = personalityInsights.value.data;
      }
      
      logger.debug('ANALYSIS', 'Advanced analysis completed');
      
      return analysis;
    } catch (error: any) {
      logger.error('ANALYSIS', 'Advanced analysis failed', error);
      throw error;
    }
  }

  private calculateOverallScore(scores: any[]): number {
    if (!scores || scores.length === 0) return 0;
    
    const validScores = scores.filter(score => score.score > 0);
    if (validScores.length === 0) return 0;
    
    const average = validScores.reduce((sum, score) => sum + score.score, 0) / validScores.length;
    return Number(average.toFixed(1));
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache(key: string, data: any, ttl: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  getHealthStatus(): HealthStatus {
    const aiHealth = aiServiceManager.getHealthStatus();
    const cacheSize = this.cache.size;
    const queueSize = this.processingQueue.size;
    
    const isHealthy = Object.values(aiHealth).some(status => status === true);
    const issues = Object.entries(aiHealth)
      .filter(([_, status]) => !status)
      .map(([name, _]) => `${name} unavailable`);
    
    return {
      isHealthy,
      services: { isHealthy, issues },
      cache: { size: cacheSize },
      queue: { size: queueSize }
    };
  }

  clearCache() {
    logger.info('ANALYSIS', 'Clearing analysis cache');
    this.cache.clear();
  }
}

export const unifiedAnalysisService = new UnifiedAnalysisService();
