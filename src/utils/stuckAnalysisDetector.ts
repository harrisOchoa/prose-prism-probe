
export interface StuckAnalysisInfo {
  isStuck: boolean;
  stuckFor: number; // milliseconds
  stuckSince: Date | null;
  affectedKeys: string[];
}

export class StuckAnalysisDetector {
  private static STUCK_THRESHOLD = 300000; // 5 minutes

  static detect(): StuckAnalysisInfo {
    const now = Date.now();
    const affectedKeys: string[] = [];
    let oldestStuckTime = now;
    let isStuck = false;

    // Check sessionStorage
    const sessionKeys = Object.keys(sessionStorage);
    for (const key of sessionKeys) {
      if (key.includes('analysis-start-') || key.includes('generating-') || key.includes('evaluating-')) {
        const timestamp = parseInt(sessionStorage.getItem(key) || '0');
        if (timestamp && (now - timestamp) > this.STUCK_THRESHOLD) {
          isStuck = true;
          affectedKeys.push(key);
          oldestStuckTime = Math.min(oldestStuckTime, timestamp);
        }
      }
    }

    // Check localStorage
    const localKeys = Object.keys(localStorage);
    for (const key of localKeys) {
      if (key.includes('analysis') || key.includes('generating') || key.includes('evaluating')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          const timestamp = data.timestamp || data.startTime;
          if (timestamp && (now - timestamp) > this.STUCK_THRESHOLD) {
            isStuck = true;
            affectedKeys.push(key);
            oldestStuckTime = Math.min(oldestStuckTime, timestamp);
          }
        } catch (e) {
          // If we can't parse it and it looks analysis-related, it might be stuck
          if (key.includes('analysis') || key.includes('generating')) {
            isStuck = true;
            affectedKeys.push(key);
          }
        }
      }
    }

    return {
      isStuck,
      stuckFor: isStuck ? now - oldestStuckTime : 0,
      stuckSince: isStuck ? new Date(oldestStuckTime) : null,
      affectedKeys
    };
  }

  static clearStuckAnalysis(): void {
    console.log('🧹 Clearing stuck analysis states...');
    
    const info = this.detect();
    if (!info.isStuck) {
      console.log('No stuck analysis detected');
      return;
    }

    console.log('Clearing stuck analysis:', info);

    // Clear affected keys
    info.affectedKeys.forEach(key => {
      if (key in sessionStorage) {
        sessionStorage.removeItem(key);
        console.log('Cleared from sessionStorage:', key);
      }
      if (key in localStorage) {
        localStorage.removeItem(key);
        console.log('Cleared from localStorage:', key);
      }
    });

    // Clear any additional analysis-related keys
    this.clearAllAnalysisKeys();
  }

  private static clearAllAnalysisKeys(): void {
    // Clear sessionStorage
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.includes('analysis') || key.includes('generating') || key.includes('evaluating')) {
        sessionStorage.removeItem(key);
        console.log('Cleared session:', key);
      }
    });

    // Clear localStorage
    const localKeys = Object.keys(localStorage);
    localKeys.forEach(key => {
      if (key.includes('analysis') || key.includes('generating') || key.includes('evaluating')) {
        localStorage.removeItem(key);
        console.log('Cleared local:', key);
      }
    });

    // Clear cached assessment data with analysis states
    const assessmentKeys = Object.keys(localStorage).filter(k => k.startsWith('assessment-'));
    assessmentKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data.analysisStatus || data.evaluating || data.generatingSummary) {
          localStorage.removeItem(key);
          console.log('Cleared cached assessment:', key);
        }
      } catch (e) {
        // Ignore parse errors
      }
    });
  }

  static logStuckAnalysisReport(): void {
    const info = this.detect();
    if (info.isStuck) {
      console.group('🚨 Stuck Analysis Report');
      console.log('Stuck for:', Math.round(info.stuckFor / 1000 / 60), 'minutes');
      console.log('Stuck since:', info.stuckSince?.toLocaleString());
      console.log('Affected keys:', info.affectedKeys);
      console.groupEnd();
    } else {
      console.log('✅ No stuck analysis detected');
    }
  }
}
