
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
  console.log("Checking for duplicate submissions among", assessments.length, "assessments");
  
  const groupedByName = assessments.reduce((groups: {[key: string]: AssessmentData[]}, assessment) => {
    // Use unique key combining name and position
    const key = `${assessment.candidateName}:${assessment.candidatePosition}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(assessment);
    return groups;
  }, {});
  
  console.log("Found", Object.keys(groupedByName).length, "unique candidates");
  
  const uniqueAssessments: AssessmentData[] = [];
  let totalDuplicatesRemoved = 0;
  
  Object.entries(groupedByName).forEach(([key, group]: [string, AssessmentData[]]) => {
    const candidateKey = key;
    console.log(`Analyzing ${group.length} submissions for candidate ${candidateKey}`);
    
    // Sort by submission date, most recent first
    const sortedGroup = [...group].sort((a, b) => {
      const dateA = a.submittedAt?.toDate?.() ?? new Date(0);
      const dateB = b.submittedAt?.toDate?.() ?? new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Enhanced deduplication logic
    const filtered: AssessmentData[] = [];
    const duplicates: AssessmentData[] = [];
    
    sortedGroup.forEach(assessment => {
      const isDuplicate = filtered.some(kept => {
        // Skip comparison if different positions (shouldn't happen due to grouping)
        if (kept.candidatePosition !== assessment.candidatePosition) return false;
        
        // If aptitude scores are different, not a duplicate
        if (kept.aptitudeScore !== assessment.aptitudeScore) {
          console.log(`Different aptitude scores: ${kept.aptitudeScore} vs ${assessment.aptitudeScore}`);
          return false;
        }
        
        // If word counts are significantly different, not a duplicate
        const keptWordCount = kept.wordCount || 0;
        const assessWordCount = assessment.wordCount || 0;
        const wordCountDiff = Math.abs(keptWordCount - assessWordCount);
        const wordCountThreshold = Math.max(keptWordCount, assessWordCount) * 0.1; // 10% threshold
        
        if (wordCountDiff > wordCountThreshold) {
          console.log(`Different word counts: ${keptWordCount} vs ${assessWordCount}`);
          return false;
        }
        
        // Check submission timestamps - if within 2 hours, likely a duplicate
        // This catches duplicates that happen during the assessment review/analysis phase
        const keptDate = kept.submittedAt?.toDate?.() ?? new Date(0);
        const currDate = assessment.submittedAt?.toDate?.() ?? new Date(0);
        const timeDiffMinutes = Math.abs(keptDate.getTime() - currDate.getTime()) / (60 * 1000);
        
        const isDup = timeDiffMinutes < 120; // Consider duplicate if within 2 hours
        
        if (isDup) {
          console.log(`Detected duplicate: ${assessment.id} (${timeDiffMinutes.toFixed(1)} minutes apart)`);
        }
        
        return isDup;
      });
      
      if (!isDuplicate) {
        filtered.push(assessment);
      } else {
        duplicates.push(assessment);
      }
    });
    
    console.log(`Kept ${filtered.length} unique submissions and removed ${duplicates.length} duplicates for ${candidateKey}`);
    totalDuplicatesRemoved += duplicates.length;
    uniqueAssessments.push(...filtered);
  });
  
  console.log(`Removed ${totalDuplicatesRemoved} duplicate assessments in total`);
  return uniqueAssessments;
};
