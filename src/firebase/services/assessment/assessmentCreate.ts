
import { collection, addDoc, serverTimestamp, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../../config';
import { AntiCheatingMetrics, AssessmentSubmission } from './types';
import { WritingScore } from '@/services/geminiService';
import { WritingPromptItem } from '@/components/AssessmentManager';

// Helper function to sanitize antiCheatingMetrics for Firestore
const sanitizeMetricsForFirestore = (metrics: AntiCheatingMetrics | undefined): AntiCheatingMetrics | null => {
  if (!metrics) {
    console.log("No metrics provided to sanitize");
    return {
      keystrokes: 0,
      pauses: 0,
      tabSwitches: 0,
      windowBlurs: 0,
      windowFocuses: 0,
      copyAttempts: 0,
      pasteAttempts: 0,
      rightClickAttempts: 0,
      suspiciousActivity: false,
      wordsPerMinute: 0
    };
  }
  
  try {
    // Create a sanitized copy that only includes primitive values
    const sanitized: AntiCheatingMetrics = {
      keystrokes: metrics.keystrokes || 0,
      pauses: metrics.pauses || 0,
      tabSwitches: metrics.tabSwitches || 0,
      windowBlurs: metrics.windowBlurs || 0,
      windowFocuses: metrics.windowFocuses || 0,
      copyAttempts: metrics.copyAttempts || 0,
      pasteAttempts: metrics.pasteAttempts || 0,
      rightClickAttempts: metrics.rightClickAttempts || 0,
      suspiciousActivity: !!metrics.suspiciousActivity,
      wordsPerMinute: metrics.wordsPerMinute || 0 // Add this property with a fallback to 0
    };
    
    // Log sanitized metrics
    console.log("Sanitized metrics:", sanitized);
    
    // Convert to JSON and back to ensure it's serializable
    return JSON.parse(JSON.stringify(sanitized));
  } catch (error) {
    console.error("Error sanitizing metrics:", error);
    return null;
  }
};

export const saveAssessmentResult = async (
  candidateName: string,
  candidatePosition: string,
  completedPrompts: WritingPromptItem[],
  aptitudeScore: number,
  aptitudeTotal: number,
  writingScores?: WritingScore[],
  antiCheatingMetrics?: AntiCheatingMetrics
): Promise<string> => {
  try {
    if (!candidateName || !candidatePosition) {
      console.error("Missing required fields for assessment submission:", { candidateName, candidatePosition });
      throw new Error('Missing required candidate information');
    }

    console.log("Starting assessment submission for:", candidateName);
    console.log("Position:", candidatePosition);
    console.log("Aptitude score:", aptitudeScore, "out of", aptitudeTotal);
    console.log("Completed prompts:", completedPrompts.length);
    console.log("Original metrics provided:", antiCheatingMetrics);
    
    // ENHANCED: More aggressive duplicate detection
    // Check for any submissions from this candidate for this position
    const candidateSubmissionsQuery = query(
      collection(db, 'assessments'),
      where('candidateName', '==', candidateName),
      where('candidatePosition', '==', candidatePosition)
    );
    
    console.log(`Checking for existing submissions for ${candidateName} as ${candidatePosition}...`);
    const querySnapshot = await getDocs(candidateSubmissionsQuery);
    
    // Extract all existing submissions for this candidate
    const existingSubmissions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as AssessmentSubmission
    }));
    
    console.log(`Found ${existingSubmissions.length} existing submissions for ${candidateName}`);
    
    // If there's any existing submission for this exact candidate and position,
    // return the ID of the most recent one (to prevent duplicates)
    if (existingSubmissions.length > 0) {
      console.log("Existing submission found, preventing duplicate creation");
      
      // Sort by submission date, most recent first
      const sortedSubmissions = existingSubmissions.sort((a, b) => {
        const dateA = a.submittedAt?.toDate?.() ?? new Date(0);
        const dateB = b.submittedAt?.toDate?.() ?? new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Return the most recent submission ID
      console.log("Using existing assessment with ID:", sortedSubmissions[0].id);
      console.log("This prevents creating a duplicate entry");
      return sortedSubmissions[0].id;
    }
    
    const wordCount = completedPrompts.reduce((total, prompt) => total + prompt.wordCount, 0);
    
    let overallWritingScore;
    if (writingScores && writingScores.length > 0) {
      const totalScore = writingScores.reduce((sum, evaluation) => sum + evaluation.score, 0);
      overallWritingScore = Number((totalScore / writingScores.length).toFixed(1));
    }
    
    console.log("Saving new assessment for:", candidateName);
    console.log("Aptitude score:", aptitudeScore);
    console.log("Word count:", wordCount);
    console.log("Anti-cheating metrics present:", !!antiCheatingMetrics);
    
    // Sanitize the anti-cheating metrics to ensure they're Firestore-compatible
    const sanitizedMetrics = sanitizeMetricsForFirestore(antiCheatingMetrics);
    console.log("Sanitized metrics:", sanitizedMetrics);
    
    const submission: AssessmentSubmission = {
      candidateName,
      candidatePosition,
      aptitudeScore,
      aptitudeTotal,
      completedPrompts,
      wordCount,
      submittedAt: serverTimestamp(),
      antiCheatingMetrics: sanitizedMetrics
    };

    if (writingScores && writingScores.length > 0) {
      submission.writingScores = writingScores;
      submission.overallWritingScore = overallWritingScore;
    }
    
    console.log("Attempting to add document to Firestore...");
    console.log("Final submission object:", JSON.stringify(submission));
    
    const docRef = await addDoc(collection(db, 'assessments'), submission);
    console.log("New assessment saved with ID:", docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving assessment:', error);
    throw new Error('Failed to save assessment results: ' + (error instanceof Error ? error.message : String(error)));
  }
};
