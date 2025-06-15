
import { AIProvider, AIServiceConfig, AIResponse } from "./types";
import { GeminiProvider } from "./providers/gemini";
import { DeepSeekProvider } from "./providers/deepseek";

export class AIServiceManager {
  private config: AIServiceConfig;
  private healthStatus: Map<string, { available: boolean, lastCheck: number, consecutiveFailures: number }> = new Map();
  private readonly HEALTH_CHECK_INTERVAL = 60000; // 1 minute
  private readonly MAX_CONSECUTIVE_FAILURES = 3;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  constructor() {
    this.config = {
      primaryProvider: new GeminiProvider(),
      fallbackProviders: [new DeepSeekProvider()],
      maxRetries: 2,
      retryDelay: 1000
    };
  }

  private async checkProviderHealthWithBackoff(provider: AIProvider): Promise<boolean> {
    const now = Date.now();
    const cached = this.healthStatus.get(provider.name);
    
    // Use cached result if recent and not too many failures
    if (cached && (now - cached.lastCheck) < this.HEALTH_CHECK_INTERVAL) {
      // If we've had consecutive failures, increase check frequency
      if (cached.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
        const backoffTime = Math.min(cached.consecutiveFailures * 30000, 300000); // Max 5 minutes
        if ((now - cached.lastCheck) < backoffTime) {
          return cached.available;
        }
      } else {
        return cached.available;
      }
    }

    try {
      const available = await provider.isAvailable();
      const consecutiveFailures = available ? 0 : (cached?.consecutiveFailures || 0) + 1;
      
      this.healthStatus.set(provider.name, { 
        available, 
        lastCheck: now,
        consecutiveFailures
      });
      
      console.log(`${provider.name} health check: ${available ? 'available' : 'unavailable'} (failures: ${consecutiveFailures})`);
      return available;
    } catch (error) {
      console.error(`Health check failed for ${provider.name}:`, error);
      const consecutiveFailures = (cached?.consecutiveFailures || 0) + 1;
      this.healthStatus.set(provider.name, { 
        available: false, 
        lastCheck: now,
        consecutiveFailures
      });
      return false;
    }
  }

  private async executeWithProviderOptimized<T>(
    provider: AIProvider,
    operation: (provider: AIProvider) => Promise<T>
  ): Promise<AIResponse<T>> {
    try {
      console.log(`Attempting operation with ${provider.name}...`);
      const startTime = Date.now();
      
      const data = await operation(provider);
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${provider.name} completed operation in ${duration}ms`);
      
      return {
        data,
        provider: provider.name,
        success: true
      };
    } catch (error: any) {
      console.error(`❌ ${provider.name} failed:`, error.message);
      
      return {
        data: null as T,
        provider: provider.name,
        success: false,
        error: error.message
      };
    }
  }

  private async addToQueue<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const operation = this.requestQueue.shift();
      if (operation) {
        try {
          await operation();
          // Small delay to prevent overwhelming APIs
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error("Queue operation failed:", error);
        }
      }
    }
    
    this.isProcessingQueue = false;
  }

  async executeWithFallbackOptimized<T>(
    operation: (provider: AIProvider) => Promise<T>
  ): Promise<AIResponse<T>> {
    const allProviders = [this.config.primaryProvider, ...this.config.fallbackProviders];
    
    // Sort providers by health status and consecutive failures
    const sortedProviders = allProviders.sort((a, b) => {
      const aHealth = this.healthStatus.get(a.name);
      const bHealth = this.healthStatus.get(b.name);
      
      if (!aHealth && !bHealth) return 0;
      if (!aHealth) return 1;
      if (!bHealth) return -1;
      
      // Prefer available providers
      if (aHealth.available !== bHealth.available) {
        return bHealth.available ? 1 : -1;
      }
      
      // Among available providers, prefer those with fewer failures
      return aHealth.consecutiveFailures - bHealth.consecutiveFailures;
    });
    
    for (const provider of sortedProviders) {
      // Check health before attempting (with exponential backoff)
      const isHealthy = await this.checkProviderHealthWithBackoff(provider);
      if (!isHealthy && provider !== this.config.primaryProvider) {
        console.log(`Skipping ${provider.name} due to health check failure`);
        continue;
      }

      const result = await this.executeWithProviderOptimized(provider, operation);
      
      if (result.success) {
        return result;
      }

      // If this was a rate limit error on primary, skip to fallback immediately
      if (result.error?.toLowerCase().includes('rate limit') && provider === this.config.primaryProvider) {
        console.log(`Rate limit detected on ${provider.name}, switching to fallback immediately`);
        continue;
      }

      // For other errors, wait before trying next provider
      if (sortedProviders.indexOf(provider) < sortedProviders.length - 1) {
        const waitTime = Math.min(this.config.retryDelay * (sortedProviders.indexOf(provider) + 1), 5000);
        console.log(`Waiting ${waitTime}ms before trying next provider...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // All providers failed
    const lastError = `All AI providers failed. Primary: ${this.config.primaryProvider.name}, Fallbacks: ${this.config.fallbackProviders.map(p => p.name).join(', ')}`;
    console.error(lastError);
    
    throw new Error(lastError);
  }

  // Public methods for each operation (now with queueing for rate limit management)
  async evaluateWriting(prompts: any[]): Promise<AIResponse<any[]>> {
    return this.addToQueue(() => 
      this.executeWithFallbackOptimized(provider => provider.generateWritingEvaluation(prompts))
    );
  }

  async generateSummary(assessmentData: any): Promise<AIResponse<string>> {
    return this.addToQueue(() =>
      this.executeWithFallbackOptimized(provider => provider.generateCandidateSummary(assessmentData))
    );
  }

  async generateStrengthsWeaknesses(assessmentData: any): Promise<AIResponse<{ strengths: string[], weaknesses: string[] }>> {
    return this.addToQueue(() =>
      this.executeWithFallbackOptimized(provider => provider.generateStrengthsAndWeaknesses(assessmentData))
    );
  }

  async generateDetailedWritingAnalysis(assessmentData: any): Promise<AIResponse<any>> {
    return this.addToQueue(() =>
      this.executeWithFallbackOptimized(provider => provider.generateDetailedWritingAnalysis(assessmentData))
    );
  }

  async generatePersonalityInsights(assessmentData: any): Promise<AIResponse<any>> {
    return this.addToQueue(() =>
      this.executeWithFallbackOptimized(provider => provider.generatePersonalityInsights(assessmentData))
    );
  }

  async generateInterviewQuestions(assessmentData: any): Promise<AIResponse<any>> {
    return this.addToQueue(() =>
      this.executeWithFallbackOptimized(provider => provider.generateInterviewQuestions(assessmentData))
    );
  }

  async generateProfileMatch(assessmentData: any): Promise<AIResponse<any>> {
    return this.addToQueue(() =>
      this.executeWithFallbackOptimized(provider => provider.generateProfileMatch(assessmentData))
    );
  }

  async generateAptitudeAnalysis(assessmentData: any): Promise<AIResponse<any>> {
    return this.addToQueue(() =>
      this.executeWithFallbackOptimized(provider => provider.generateAptitudeAnalysis(assessmentData))
    );
  }

  getHealthStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    this.healthStatus.forEach((health, provider) => {
      status[provider] = health.available;
    });
    return status;
  }

  getDetailedHealthStatus(): Record<string, { available: boolean, consecutiveFailures: number, lastCheck: number }> {
    const status: Record<string, any> = {};
    this.healthStatus.forEach((health, provider) => {
      status[provider] = health;
    });
    return status;
  }
}

// Export singleton instance
export const aiServiceManager = new AIServiceManager();
