
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
    
    // Check for recent submissions to avoid duplicates
    const recentSubmissionsQuery = query(
      collection(db, 'assessments'),
      where('candidateName', '==', candidateName),
      where('candidatePosition', '==', candidatePosition)
    );
    
    console.log("Checking for existing submissions...");
    const querySnapshot = await getDocs(recentSubmissionsQuery);
    
    // Extract all existing submissions for this candidate
    const recentSubmissions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as AssessmentSubmission
    }));
    
    console.log(`Found ${recentSubmissions.length} existing submissions for ${candidateName}`);
    
    const now = new Date();
    const potentialDuplicates = recentSubmissions.filter(submission => {
      if (submission.submittedAt && submission.submittedAt.toDate) {
        const submissionTime = submission.submittedAt.toDate();
        // More stringent duplicate detection:
        // 1. Submitted within the last hour (extended from 30 min)
        // 2. Same aptitude score and total
        // 3. Similar word count (within 10% variance)
        const timeDiffMinutes = (now.getTime() - submissionTime.getTime()) / (60 * 1000);
        const wordCount = completedPrompts.reduce((total, prompt) => total + prompt.wordCount, 0);
        
        const similarAptitudeScore = submission.aptitudeScore === aptitudeScore;
        const similarAptitudeTotal = submission.aptitudeTotal === aptitudeTotal;
        
        // If word counts within 10% of each other - indicates same submission
        let similarWordCount = false;
        if (submission.wordCount && wordCount) {
          const wordCountDiffPercent = Math.abs(submission.wordCount - wordCount) / Math.max(submission.wordCount, wordCount);
          similarWordCount = wordCountDiffPercent < 0.1; // Within 10% difference
        }
        
        const isDuplicate = timeDiffMinutes < 60 && 
               similarAptitudeScore && 
               similarAptitudeTotal &&
               similarWordCount;
               
        if (isDuplicate) {
          console.log("Detected duplicate submission with details:", {
            timeDiffMinutes,
            originalId: submission.id,
            originalAptitude: submission.aptitudeScore,
            newAptitude: aptitudeScore, 
            originalWordCount: submission.wordCount,
            newWordCount: wordCount
          });
        }
        
        return isDuplicate;
      }
      return false;
    });
    
    if (potentialDuplicates.length > 0) {
      console.log("Detected duplicate submission for:", candidateName);
      console.log("Using existing record ID:", potentialDuplicates[0].id);
      console.log("Time since original submission:", potentialDuplicates[0].submittedAt.toDate ? 
        Math.round((now.getTime() - potentialDuplicates[0].submittedAt.toDate().getTime()) / (60 * 1000)) + " minutes" : "unknown");
      return potentialDuplicates[0].id;
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
