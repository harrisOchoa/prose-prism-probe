
import { DocumentData } from "firebase/firestore";
import { AssessmentData } from "@/types/assessment";

export const processAssessmentData = (assessmentData: AssessmentData[]): AssessmentData[] => {
  console.log("Raw assessment data from Firebase:", assessmentData);
  
  const processedResults = assessmentData.map(assessment => {
    if (assessment.aptitudeScore !== undefined && assessment.aptitudeScore !== null) {
      console.log(`Assessment ${assessment.id} has aptitude score: ${assessment.aptitudeScore}`);
      return assessment;
    }
    
    if (assessment.aptitudeAnswers && Array.isArray(assessment.aptitudeAnswers)) {
      console.log(`Assessment ${assessment.id} has aptitude answers array of length: ${assessment.aptitudeAnswers.length}`);
      const recoveredScore = assessment.aptitudeAnswers.filter(a => a !== 0).length;
      console.log(`Recovered score for ${assessment.id}: ${recoveredScore}`);
      
      return {
        ...assessment,
        aptitudeScore: recoveredScore,
        aptitudeTotal: assessment.aptitudeTotal || 30
      };
    }
    
    if (assessment.aptitudeData && assessment.aptitudeData.correctAnswers !== undefined) {
      console.log(`Assessment ${assessment.id} has aptitude data with correct answers: ${assessment.aptitudeData.correctAnswers}`);
      return {
        ...assessment,
        aptitudeScore: assessment.aptitudeData.correctAnswers,
        aptitudeTotal: assessment.aptitudeTotal || 30
      };
    }
    
    console.log(`Assessment ${assessment.id} has missing aptitude score and no recoverable data`);
    return {
      ...assessment,
      aptitudeScore: 0,
      aptitudeTotal: assessment.aptitudeTotal || 30
    };
  });
  
  return processedResults;
};

export const mapFirebaseDocToAssessment = (doc: DocumentData): AssessmentData => {
  const data = doc.data() as DocumentData;
  return {
    id: doc.id,
    ...data
  } as AssessmentData;
};

export const removeDuplicateSubmissions = (assessments: AssessmentData[]): AssessmentData[] => {
  const groupedByName = assessments.reduce((groups: {[key: string]: AssessmentData[]}, assessment) => {
    // Use unique key combining name and position
    const key = `${assessment.candidateName}:${assessment.candidatePosition}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(assessment);
    return groups;
  }, {});
  
  const uniqueAssessments: AssessmentData[] = [];
  
  Object.values(groupedByName).forEach((group: AssessmentData[]) => {
    // Sort by submission date, most recent first
    const sortedGroup = [...group].sort((a, b) => {
      const dateA = a.submittedAt?.toDate?.() ?? new Date(0);
      const dateB = b.submittedAt?.toDate?.() ?? new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    // More sophisticated deduplication logic
    const filtered: AssessmentData[] = [];
    sortedGroup.forEach(assessment => {
      const isDuplicate = filtered.some(kept => {
        // Check for criteria that would indicate this is a true duplicate
        if (kept.candidatePosition !== assessment.candidatePosition) return false;
        if (kept.aptitudeScore !== assessment.aptitudeScore) return false;
        
        // If word counts are significantly different, not a duplicate
        const wordCountDiff = Math.abs(kept.wordCount - assessment.wordCount);
        const wordCountThreshold = Math.max(kept.wordCount, assessment.wordCount) * 0.1; // 10% threshold
        if (wordCountDiff > wordCountThreshold) return false;
        
        // Check submission timestamps - if within 30 minutes, likely a duplicate
        const keptDate = kept.submittedAt?.toDate?.() ?? new Date(0);
        const currDate = assessment.submittedAt?.toDate?.() ?? new Date(0);
        const timeDiffMinutes = Math.abs(keptDate.getTime() - currDate.getTime()) / (60 * 1000);
        
        return timeDiffMinutes < 30; // Consider duplicate if within 30 minutes
      });
      
      if (!isDuplicate) {
        filtered.push(assessment);
      } else {
        console.log(`Filtered duplicate assessment ${assessment.id} for ${assessment.candidateName}`);
      }
    });
    
    uniqueAssessments.push(...filtered);
  });
  
  console.log(`Removed ${assessments.length - uniqueAssessments.length} duplicate assessments`);
  return uniqueAssessments;
};
