
import { AIProvider, AIServiceConfig, AIResponse } from "./types";
import { GeminiProvider } from "./providers/gemini";
import { DeepSeekProvider } from "./providers/deepseek";

export class AIServiceManager {
  private config: AIServiceConfig;
  private healthStatus: Map<string, { available: boolean, lastCheck: number }> = new Map();
  private readonly HEALTH_CHECK_INTERVAL = 60000; // 1 minute

  constructor() {
    this.config = {
      primaryProvider: new GeminiProvider(),
      fallbackProviders: [new DeepSeekProvider()],
      maxRetries: 2,
      retryDelay: 1000
    };
  }

  private async checkProviderHealth(provider: AIProvider): Promise<boolean> {
    const now = Date.now();
    const cached = this.healthStatus.get(provider.name);
    
    // Use cached result if recent
    if (cached && (now - cached.lastCheck) < this.HEALTH_CHECK_INTERVAL) {
      return cached.available;
    }

    try {
      const available = await provider.isAvailable();
      this.healthStatus.set(provider.name, { available, lastCheck: now });
      console.log(`${provider.name} health check: ${available ? 'available' : 'unavailable'}`);
      return available;
    } catch (error) {
      console.error(`Health check failed for ${provider.name}:`, error);
      this.healthStatus.set(provider.name, { available: false, lastCheck: now });
      return false;
    }
  }

  private async executeWithProvider<T>(
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

  async executeWithFallback<T>(
    operation: (provider: AIProvider) => Promise<T>
  ): Promise<AIResponse<T>> {
    const allProviders = [this.config.primaryProvider, ...this.config.fallbackProviders];
    
    for (const provider of allProviders) {
      // Check health before attempting
      const isHealthy = await this.checkProviderHealth(provider);
      if (!isHealthy && provider !== this.config.primaryProvider) {
        console.log(`Skipping ${provider.name} due to health check failure`);
        continue;
      }

      const result = await this.executeWithProvider(provider, operation);
      
      if (result.success) {
        return result;
      }

      // If this was a rate limit error on primary, skip to fallback immediately
      if (result.error?.toLowerCase().includes('rate limit') && provider === this.config.primaryProvider) {
        console.log(`Rate limit detected on ${provider.name}, switching to fallback immediately`);
        continue;
      }

      // For other errors, wait before trying next provider
      if (allProviders.indexOf(provider) < allProviders.length - 1) {
        console.log(`Waiting ${this.config.retryDelay}ms before trying next provider...`);
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
      }
    }

    // All providers failed
    const lastError = `All AI providers failed. Primary: ${this.config.primaryProvider.name}, Fallbacks: ${this.config.fallbackProviders.map(p => p.name).join(', ')}`;
    console.error(lastError);
    
    throw new Error(lastError);
  }

  // Public methods for each operation
  async evaluateWriting(prompts: any[]): Promise<AIResponse<any[]>> {
    return this.executeWithFallback(provider => provider.generateWritingEvaluation(prompts));
  }

  async generateSummary(assessmentData: any): Promise<AIResponse<string>> {
    return this.executeWithFallback(provider => provider.generateCandidateSummary(assessmentData));
  }

  async generateStrengthsWeaknesses(assessmentData: any): Promise<AIResponse<{ strengths: string[], weaknesses: string[] }>> {
    return this.executeWithFallback(provider => provider.generateStrengthsAndWeaknesses(assessmentData));
  }

  async generateDetailedWritingAnalysis(assessmentData: any): Promise<AIResponse<any>> {
    return this.executeWithFallback(provider => provider.generateDetailedWritingAnalysis(assessmentData));
  }

  async generatePersonalityInsights(assessmentData: any): Promise<AIResponse<any>> {
    return this.executeWithFallback(provider => provider.generatePersonalityInsights(assessmentData));
  }

  async generateInterviewQuestions(assessmentData: any): Promise<AIResponse<any>> {
    return this.executeWithFallback(provider => provider.generateInterviewQuestions(assessmentData));
  }

  async generateProfileMatch(assessmentData: any): Promise<AIResponse<any>> {
    return this.executeWithFallback(provider => provider.generateProfileMatch(assessmentData));
  }

  async generateAptitudeAnalysis(assessmentData: any): Promise<AIResponse<any>> {
    return this.executeWithFallback(provider => provider.generateAptitudeAnalysis(assessmentData));
  }

  getHealthStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    this.healthStatus.forEach((health, provider) => {
      status[provider] = health.available;
    });
    return status;
  }
}

// Export singleton instance
export const aiServiceManager = new AIServiceManager();
