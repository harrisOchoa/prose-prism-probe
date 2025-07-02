import { logger } from '../logging';

/**
 * Service for tracking and managing code optimizations
 */
class CodeOptimizationService {
  private optimizations: Map<string, any> = new Map();

  trackOptimization(component: string, type: string, improvement: string) {
    logger.info('OPTIMIZATION', `Applied ${type} optimization to ${component}`, { improvement });
    
    this.optimizations.set(`${component}_${type}`, {
      component,
      type,
      improvement,
      timestamp: Date.now()
    });
  }

  getOptimizationSummary() {
    return Array.from(this.optimizations.values());
  }

  clearOptimizations() {
    this.optimizations.clear();
  }
}

export const codeOptimizationService = new CodeOptimizationService();