import { logger } from '../logging';
import { aiServiceManager } from '../ai/AIServiceManager';
import { requestDeduplicator } from './RequestDeduplicator';
import { performanceMonitor } from '../monitoring/PerformanceMonitor';
import { LRUCache } from '@/utils/LRUCache';

export type AIServiceHealth = {
  isHealthy: boolean;
  issues: string[];
};

export type CacheStats = {
  size: number;
  hitRate: number;
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
 * Optimized Unified Analysis Service with LRU caching and performance improvements
 */
class OptimizedUnifiedAnalysisService {
  private cache: LRUCache<string, any>;
  private processingQueue = new Map<string, Promise<AnalysisProgress>>();
  private cacheHits = 0;
  private cacheMisses = 0;
  
  constructor() {
    this.cache = new LRUCache<string, any>(100); // Increased capacity
    logger.info('SYSTEM', 'OptimizedUnifiedAnalysisService initialized with LRU cache');
  }

  /**
   * Main analysis entry point with enhanced caching and deduplication
   */
  async analyzeAssessment(request: AnalysisRequest): Promise<AnalysisProgress> {
    const requestId = request.requestId || `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const cacheKey = this.generateCacheKey(request);
    
    logger.analysisStart(request.assessmentId, 'optimized_unified');
    performanceMonitor.startTimer(`analysis_${requestId}`);

    // Check cache first with better key generation
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.cacheHits++;
      logger.info('ANALYSIS', 'Cache hit - returning cached result', { 
        assessmentId: request.assessmentId,
        hitRate: this.getCacheHitRate()
      });
      return {
        status: 'completed',
        results: cached,
        requestId
      };
    }

    this.cacheMisses++;

    // Deduplicate requests with enhanced key generation
    const deduplicatedRequest = await requestDeduplicator.deduplicate(
      cacheKey,
      () => this.performOptimizedAnalysis({ ...request, requestId })
    );

    return deduplicatedRequest;
  }

  private generateCacheKey(request: AnalysisRequest): string {
    // More efficient cache key generation
    const dataHash = this.hashAssessmentData(request.assessmentData);
    return `${request.assessmentId}_${dataHash}_${request.priority}`;
  }

  private hashAssessmentData(data: any): string {
    // Simple hash function for assessment data
    if (!data) return 'empty';
    
    const key = `${data.aptitudeScore || 0}_${(data.completedPrompts?.length || 0)}_${(data.overallWritingScore || 0)}`;
    return key;
  }

  private async performOptimizedAnalysis(request: AnalysisRequest): Promise<AnalysisProgress> {
    const { assessmentId, assessmentData, priority, requestId } = request;
    
    try {
      // Enhanced validation
      if (!assessmentData || !assessmentId) {
        throw new Error('Invalid assessment data provided');
      }

      logger.info('ANALYSIS', 'Processing optimized analysis request', { 
        assessmentId, 
        priority,
        hasWritingPrompts: !!assessmentData.completedPrompts?.length,
        hasAptitudeResults: !!assessmentData.aptitudeResults?.categories,
        cacheHitRate: this.getCacheHitRate()
      });

      const results: any = {};
      
      // Parallel processing for better performance
      const analysisPromises: Promise<any>[] = [];
      
      // Step 1: Evaluate writing if available
      if (assessmentData.completedPrompts?.length > 0) {
        analysisPromises.push(
          this.evaluateWritingOptimized(assessmentData.completedPrompts)
            .then(scores => {
              results.writingScores = scores;
              results.overallWritingScore = this.calculateOverallScore(scores);
            })
        );
      }

      // Step 2: Generate insights in parallel
      analysisPromises.push(
        this.generateInsightsOptimized(assessmentData, results)
          .then(insights => {
            results.candidateInsights = insights;
          })
      );

      // Step 3: Advanced analysis if high priority
      if (priority === 'high') {
        analysisPromises.push(
          this.generateAdvancedAnalysisOptimized(assessmentData, results)
            .then(advanced => {
              results.advancedAnalysis = advanced;
            })
        );
      }

      // Wait for all analysis to complete
      await Promise.all(analysisPromises);

      // Cache successful results with TTL based on priority
      const ttl = priority === 'high' ? 600000 : 300000; // 10min for high, 5min for others
      this.cache.set(this.generateCacheKey(request), results, ttl);

      const duration = performanceMonitor.endTimer(`analysis_${requestId!}`);
      logger.analysisComplete(assessmentId, 'optimized_unified', duration || 0);

      return {
        status: 'completed',
        results,
        requestId: requestId!
      };

    } catch (error: any) {
      logger.analysisError(assessmentId, 'optimized_unified', error);
      performanceMonitor.endTimer(`analysis_${requestId!}`);
      
      return {
        status: 'failed',
        error: error.message,
        requestId: requestId!
      };
    }
  }

  private async evaluateWritingOptimized(prompts: any[]): Promise<any[]> {
    try {
      logger.debug('ANALYSIS', 'Starting optimized writing evaluation', { promptCount: prompts.length });
      
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
      
      logger.debug('ANALYSIS', 'Optimized writing evaluation completed', { resultCount: response.data.length });
      
      return response.data;
    } catch (error: any) {
      logger.error('ANALYSIS', 'Optimized writing evaluation failed', error);
      throw error;
    }
  }

  private async generateInsightsOptimized(assessmentData: any, analysisResults: any): Promise<any> {
    try {
      logger.debug('ANALYSIS', 'Generating optimized insights');
      
      const response = await aiServiceManager.generateSummary(assessmentData);
      if (!response.success || !response.data) {
        throw new Error(`Insights generation failed: ${response.error || 'Unknown error'}`);
      }
      
      logger.debug('ANALYSIS', 'Optimized insights generation completed');
      
      return response.data;
    } catch (error: any) {
      logger.error('ANALYSIS', 'Optimized insights generation failed', error);
      throw error;
    }
  }

  private async generateAdvancedAnalysisOptimized(assessmentData: any, basicResults: any): Promise<any> {
    try {
      logger.debug('ANALYSIS', 'Generating optimized advanced analysis');
      
      // Use Promise.allSettled for better error resilience
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
      
      logger.debug('ANALYSIS', 'Optimized advanced analysis completed');
      
      return analysis;
    } catch (error: any) {
      logger.error('ANALYSIS', 'Optimized advanced analysis failed', error);
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

  private getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total > 0 ? Number((this.cacheHits / total * 100).toFixed(2)) : 0;
  }

  getHealthStatus(): HealthStatus {
    const aiHealth = aiServiceManager.getHealthStatus();
    const cacheSize = this.cache.size();
    const queueSize = this.processingQueue.size;
    
    const isHealthy = Object.values(aiHealth).some(status => status === true);
    const issues = Object.entries(aiHealth)
      .filter(([_, status]) => !status)
      .map(([name, _]) => `${name} unavailable`);
    
    return {
      isHealthy,
      services: { isHealthy, issues },
      cache: { size: cacheSize, hitRate: this.getCacheHitRate() },
      queue: { size: queueSize }
    };
  }

  clearCache() {
    logger.info('ANALYSIS', 'Clearing optimized analysis cache');
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}

export const optimizedUnifiedAnalysisService = new OptimizedUnifiedAnalysisService();
