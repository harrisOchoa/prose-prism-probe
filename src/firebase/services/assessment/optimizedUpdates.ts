import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../../config';
import { AssessmentSubmission } from './types';

interface BatchUpdate {
  assessmentId: string;
  data: Partial<AssessmentSubmission>;
  timestamp: number;
}

class OptimizedAssessmentUpdater {
  private pendingUpdates = new Map<string, BatchUpdate>();
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 1000; // 1 second
  private readonly MAX_BATCH_SIZE = 10;

  async updateAssessmentOptimized(
    assessmentId: string,
    data: Partial<AssessmentSubmission>,
    immediate = false
  ): Promise<boolean> {
    if (immediate) {
      return this.executeImmediateUpdate(assessmentId, data);
    }

    // Add to batch queue
    this.pendingUpdates.set(assessmentId, {
      assessmentId,
      data: { ...this.pendingUpdates.get(assessmentId)?.data, ...data },
      timestamp: Date.now()
    });

    // Schedule batch execution
    this.scheduleBatchExecution();
    
    return true;
  }

  private async executeImmediateUpdate(
    assessmentId: string,
    data: Partial<AssessmentSubmission>
  ): Promise<boolean> {
    try {
      console.log(`Immediate update for assessment ${assessmentId}`);
      const assessmentRef = doc(db, 'assessments', assessmentId);
      
      const batch = writeBatch(db);
      batch.update(assessmentRef, this.sanitizeUpdateData(data));
      
      await batch.commit();
      console.log(`Immediate update completed for ${assessmentId}`);
      return true;
    } catch (error: any) {
      console.error(`Immediate update failed for ${assessmentId}:`, error);
      throw new Error(`Failed to update assessment: ${error.message}`);
    }
  }

  private scheduleBatchExecution(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    // Execute immediately if we hit max batch size
    if (this.pendingUpdates.size >= this.MAX_BATCH_SIZE) {
      this.executeBatch();
      return;
    }

    // Otherwise schedule for later
    this.batchTimer = setTimeout(() => {
      this.executeBatch();
    }, this.BATCH_DELAY);
  }

  private async executeBatch(): Promise<void> {
    if (this.pendingUpdates.size === 0) return;

    const updates = Array.from(this.pendingUpdates.values());
    this.pendingUpdates.clear();
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      console.log(`Executing batch update for ${updates.length} assessments`);
      
      const batch = writeBatch(db);
      
      updates.forEach(update => {
        const assessmentRef = doc(db, 'assessments', update.assessmentId);
        batch.update(assessmentRef, this.sanitizeUpdateData(update.data));
      });
      
      await batch.commit();
      console.log(`Batch update completed for ${updates.length} assessments`);
    } catch (error: any) {
      console.error(`Batch update failed:`, error);
      
      // Retry individual updates
      for (const update of updates) {
        try {
          await this.executeImmediateUpdate(update.assessmentId, update.data);
        } catch (retryError) {
          console.error(`Retry failed for ${update.assessmentId}:`, retryError);
        }
      }
    }
  }

  private sanitizeUpdateData(data: Partial<AssessmentSubmission>): any {
    const sanitized = { ...data };
    
    // Remove empty arrays that shouldn't overwrite existing data
    Object.keys(sanitized).forEach(key => {
      const value = sanitized[key as keyof AssessmentSubmission];
      if (Array.isArray(value) && value.length === 0) {
        delete sanitized[key as keyof AssessmentSubmission];
      }
      if (value === "" || value === null || value === undefined) {
        delete sanitized[key as keyof AssessmentSubmission];
      }
    });
    
    return sanitized;
  }

  // Force flush any pending updates
  async flush(): Promise<void> {
    if (this.pendingUpdates.size > 0) {
      await this.executeBatch();
    }
  }
}

// Export singleton instance
export const optimizedAssessmentUpdater = new OptimizedAssessmentUpdater();

// Backward compatible wrapper
export const updateAssessmentAnalysisOptimized = async (
  assessmentId: string,
  analysisData: Partial<AssessmentSubmission>,
  immediate = false
): Promise<boolean> => {
  return optimizedAssessmentUpdater.updateAssessmentOptimized(assessmentId, analysisData, immediate);
};
