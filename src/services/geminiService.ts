
// This file re-exports all functionality from the gemini directory for backward compatibility
import * as geminiServices from './gemini';
import { trackApiCall } from './analytics/apiUsageTracker';
import { batchRequest } from './api/batchService';

// Re-export all functions with enhanced tracking
export const evaluateAllWritingPrompts = async (...args: Parameters<typeof geminiServices.evaluateAllWritingPrompts>) => {
  const startTime = Date.now();
  try {
    const result = await batchRequest(
      'evaluateAllWritingPrompts',
      () => geminiServices.evaluateAllWritingPrompts(...args),
      2 // Higher priority
    );
    trackApiCall('gemini/evaluateAllWritingPrompts', true, false, startTime);
    return result;
  } catch (error: any) {
    const isRateLimit = error.message?.toLowerCase().includes('rate limit');
    trackApiCall('gemini/evaluateAllWritingPrompts', false, isRateLimit, startTime);
    throw error;
  }
};

export const generateCandidateSummary = async (...args: Parameters<typeof geminiServices.generateCandidateSummary>) => {
  const startTime = Date.now();
  try {
    const result = await batchRequest(
      'generateCandidateSummary',
      () => geminiServices.generateCandidateSummary(...args),
      1 // Medium priority
    );
    trackApiCall('gemini/generateCandidateSummary', true, false, startTime);
    return result;
  } catch (error: any) {
    const isRateLimit = error.message?.toLowerCase().includes('rate limit');
    trackApiCall('gemini/generateCandidateSummary', false, isRateLimit, startTime);
    throw error;
  }
};

export const generateStrengthsAndWeaknesses = async (...args: Parameters<typeof geminiServices.generateStrengthsAndWeaknesses>) => {
  const startTime = Date.now();
  try {
    const result = await batchRequest(
      'generateStrengthsAndWeaknesses',
      () => geminiServices.generateStrengthsAndWeaknesses(...args),
      1 // Medium priority
    );
    trackApiCall('gemini/generateStrengthsAndWeaknesses', true, false, startTime);
    return result;
  } catch (error: any) {
    const isRateLimit = error.message?.toLowerCase().includes('rate limit');
    trackApiCall('gemini/generateStrengthsAndWeaknesses', false, isRateLimit, startTime);
    throw error;
  }
};

// Re-export all other functions directly
export * from './gemini';
