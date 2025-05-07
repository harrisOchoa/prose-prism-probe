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
  
  if (!assessments || assessments.length === 0) {
    return [];
  }
  
  // First, filter out assessments with missing essential data
  const validAssessments = assessments.filter(assessment => {
    const hasName = !!assessment.candidateName;
    const hasPosition = !!assessment.candidatePosition;
    if (!hasName || !hasPosition) {
      console.log(`Skipping assessment ${assessment.id} due to missing name or position`);
      return false;
    }
    return true;
  });
  
  // ENHANCED: Create normalized keys for more consistent grouping
  // Step 1: Group by candidate name AND position to find potential duplicates
  const groupedByNameAndPosition = validAssessments.reduce((groups: {[key: string]: AssessmentData[]}, assessment) => {
    // Use normalized keys if available, otherwise normalize them ourselves
    const nameNormalized = assessment.candidateNameNormalized || 
                           (assessment.candidateName?.toLowerCase().trim() || "");
                           
    const positionNormalized = assessment.candidatePositionNormalized || 
                              (assessment.candidatePosition?.toLowerCase().trim() || "");
    
    // Use unique key combining name and position
    const key = `${nameNormalized}:${positionNormalized}`;
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(assessment);
    return groups;
  }, {});
  
  console.log("Found", Object.keys(groupedByNameAndPosition).length, "unique candidates");
  
  const uniqueAssessments: AssessmentData[] = [];
  let totalDuplicatesRemoved = 0;
  
  // Step 2: For each candidate, keep only one assessment (prioritizing completed ones)
  Object.entries(groupedByNameAndPosition).forEach(([key, group]: [string, AssessmentData[]]) => {
    if (group.length === 1) {
      // If only one assessment, keep it
      uniqueAssessments.push(group[0]);
      return;
    }
    
    console.log(`Analyzing ${group.length} submissions for candidate key ${key}`);
    
    // ENHANCED: Better prioritization with multiple criteria
    // If multiple assessments, prioritize with this hierarchy:
    // 1. Completed analysis over pending/failed
    // 2. Has insights/scores over no insights
    // 3. Most recent submission date
    
    // Get assessments with completed analysis
    const completedAssessments = group.filter(a => 
      a.analysisStatus === 'completed' || 
      a.analysisStatus === 'basic_insights_generated' ||
      a.analysisStatus === 'writing_evaluated'
    );
    
    if (completedAssessments.length > 0) {
      console.log(`Found ${completedAssessments.length} completed assessments for ${key}`);
      
      // Further prioritize by those with actual generated content
      const withInsights = completedAssessments.filter(a => 
        a.aiSummary || (a.writingScores && a.writingScores.length > 0)
      );
      
      const priorityAssessments = withInsights.length > 0 ? withInsights : completedAssessments;
      
      // Sort by submission date and keep the most recent
      const mostRecent = priorityAssessments.sort((a, b) => {
        const dateA = a.submittedAt?.toDate?.() ?? new Date(0);
        const dateB = b.submittedAt?.toDate?.() ?? new Date(0);
        return dateB.getTime() - dateA.getTime();
      })[0];
      
      console.log(`Keeping assessment ${mostRecent.id} for ${key} (completed & most recent)`);
      uniqueAssessments.push(mostRecent);
      totalDuplicatesRemoved += group.length - 1;
    } else {
      // If no completed assessments, sort by submission date and keep the most recent
      const sortedGroup = [...group].sort((a, b) => {
        const dateA = a.submittedAt?.toDate?.() ?? new Date(0);
        const dateB = b.submittedAt?.toDate?.() ?? new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log(`Keeping assessment ${sortedGroup[0].id} for ${key} (most recent)`);
      uniqueAssessments.push(sortedGroup[0]);
      totalDuplicatesRemoved += group.length - 1;
    }
  });
  
  console.log(`Removed ${totalDuplicatesRemoved} duplicate assessments in total`);
  console.log(`Returning ${uniqueAssessments.length} unique assessments`);
  return uniqueAssessments;
};
