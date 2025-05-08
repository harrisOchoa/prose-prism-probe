
import { collection, addDoc, serverTimestamp, query, where, getDocs, DocumentData, Timestamp, limit, orderBy } from 'firebase/firestore';
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
    
    // Generate normalized versions of candidate name and position to avoid case/whitespace duplicates
    const normalizedName = candidateName.toLowerCase().trim();
    const normalizedPosition = candidatePosition.toLowerCase().trim();
    
    // CHANGED: Instead of a compound query, use a simpler approach that doesn't require indexes
    // First check by candidateName only (more common, less likely to need index)
    const nameCandidateQuery = query(
      collection(db, 'assessments'),
      where('candidateName', '==', candidateName),
      limit(10)
    );
    
    console.log(`Checking for existing submissions for ${candidateName}...`);
    const nameQuerySnapshot = await getDocs(nameCandidateQuery);
    
    // If we find results for the name, filter in memory for the position match
    if (!nameQuerySnapshot.empty) {
      console.log(`Found ${nameQuerySnapshot.docs.length} submissions with name ${candidateName}`);
      // Filter in memory by position
      const matchingDocs = nameQuerySnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.candidatePosition === candidatePosition;
      });
      
      if (matchingDocs.length > 0) {
        console.log(`Found ${matchingDocs.length} existing submissions for ${candidateName} as ${candidatePosition}`);
        const mostRecentDoc = matchingDocs[0]; // Just use first match since we can't sort in memory easily
        console.log("Using existing assessment with ID:", mostRecentDoc.id);
        return mostRecentDoc.id;
      }
    }
    
    // No match found, create new assessment
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
      candidateNameNormalized: normalizedName, // Add normalized fields for better matching
      candidatePositionNormalized: normalizedPosition,
      aptitudeScore,
      aptitudeTotal,
      completedPrompts,
      wordCount,
      submittedAt: serverTimestamp(),
      antiCheatingMetrics: sanitizedMetrics,
      submissionId: `${normalizedName}-${normalizedPosition}-${Date.now()}` // Add unique submission ID
    };

    if (writingScores && writingScores.length > 0) {
      submission.writingScores = writingScores;
      submission.overallWritingScore = overallWritingScore;
    }
    
    console.log("Attempting to add document to Firestore...");
    console.log("Final submission object properties:", Object.keys(submission));
    
    const docRef = await addDoc(collection(db, 'assessments'), submission);
    console.log("New assessment saved with ID:", docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving assessment:', error);
    throw new Error('Failed to save assessment results: ' + (error instanceof Error ? error.message : String(error)));
  }
};
