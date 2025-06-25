
import { logger } from '../logging';

interface AnalysisAttempt {
  assessmentId: string;
  timestamp: number;
  attempts: number;
  lastError?: string;
}

class AnalysisLoopPrevention {
  private readonly MAX_ATTEMPTS = 3;
  private readonly COOLDOWN_PERIOD = 5 * 60 * 1000; // 5 minutes
  private readonly TIMEOUT_DURATION = 30 * 1000; // 30 seconds
  
  private attempts = new Map<string, AnalysisAttempt>();
  private activeAnalyses = new Set<string>();

  /**
   * Check if analysis should be allowed for this assessment
   */
  canStartAnalysis(assessmentId: string): boolean {
    const attempt = this.attempts.get(assessmentId);
    
    if (!attempt) {
      return true;
    }

    // Check if we're in cooldown period
    const timeSinceLastAttempt = Date.now() - attempt.timestamp;
    if (timeSinceLastAttempt < this.COOLDOWN_PERIOD && attempt.attempts >= this.MAX_ATTEMPTS) {
      logger.warn('ANALYSIS_LOOP', 'Analysis blocked due to cooldown', {
        assessmentId,
        attempts: attempt.attempts,
        timeSinceLastAttempt
      });
      return false;
    }

    // Reset attempts if cooldown period has passed
    if (timeSinceLastAttempt >= this.COOLDOWN_PERIOD) {
      this.attempts.delete(assessmentId);
      return true;
    }

    return attempt.attempts < this.MAX_ATTEMPTS;
  }

  /**
   * Record an analysis attempt
   */
  recordAttempt(assessmentId: string, error?: string): void {
    const existing = this.attempts.get(assessmentId);
    
    this.attempts.set(assessmentId, {
      assessmentId,
      timestamp: Date.now(),
      attempts: (existing?.attempts || 0) + 1,
      lastError: error
    });

    logger.info('ANALYSIS_LOOP', 'Recorded analysis attempt', {
      assessmentId,
      attempts: this.attempts.get(assessmentId)?.attempts
    });
  }

  /**
   * Mark analysis as started
   */
  startAnalysis(assessmentId: string): boolean {
    if (this.activeAnalyses.has(assessmentId)) {
      logger.warn('ANALYSIS_LOOP', 'Analysis already active', { assessmentId });
      return false;
    }

    this.activeAnalyses.add(assessmentId);
    return true;
  }

  /**
   * Mark analysis as completed
   */
  completeAnalysis(assessmentId: string): void {
    this.activeAnalyses.delete(assessmentId);
    // Reset attempts on successful completion
    this.attempts.delete(assessmentId);
    
    logger.info('ANALYSIS_LOOP', 'Analysis completed successfully', { assessmentId });
  }

  /**
   * Mark analysis as failed
   */
  failAnalysis(assessmentId: string, error: string): void {
    this.activeAnalyses.delete(assessmentId);
    this.recordAttempt(assessmentId, error);
    
    logger.error('ANALYSIS_LOOP', 'Analysis failed', { assessmentId, error });
  }

  /**
   * Create a timeout wrapper for analysis operations
   */
  withTimeout<T>(operation: () => Promise<T>, timeoutMs: number = this.TIMEOUT_DURATION): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Analysis operation timed out')), timeoutMs);
      })
    ]);
  }

  /**
   * Get current status for an assessment
   */
  getStatus(assessmentId: string) {
    const attempt = this.attempts.get(assessmentId);
    const isActive = this.activeAnalyses.has(assessmentId);
    
    return {
      isActive,
      attempts: attempt?.attempts || 0,
      lastError: attempt?.lastError,
      canStart: this.canStartAnalysis(assessmentId),
      cooldownRemaining: attempt ? Math.max(0, this.COOLDOWN_PERIOD - (Date.now() - attempt.timestamp)) : 0
    };
  }

  /**
   * Clear all tracking data (for testing or reset)
   */
  reset(): void {
    this.attempts.clear();
    this.activeAnalyses.clear();
    logger.info('ANALYSIS_LOOP', 'Analysis loop prevention reset');
  }
}

export const analysisLoopPrevention = new AnalysisLoopPrevention();
