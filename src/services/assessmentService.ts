
import { query, collection, orderBy, limit, startAfter, getDocs, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { AssessmentData, AssessmentPaginationState } from "@/types/assessment";
import { mapFirebaseDocToAssessment, processAssessmentData, removeDuplicateSubmissions } from "@/utils/assessmentProcessing";

export const fetchAssessmentBatch = async (
  lastDoc: QueryDocumentSnapshot | null,
  itemsPerPage: number
): Promise<{
  assessments: AssessmentData[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}> => {
  try {
    let assessmentsQuery;
    
    if (!lastDoc) {
      // First page query
      assessmentsQuery = query(
        collection(db, "assessments"),
        orderBy("submittedAt", "desc"),
        limit(itemsPerPage)
      );
    } else {
      // Subsequent pages - use pagination with startAfter
      assessmentsQuery = query(
        collection(db, "assessments"),
        orderBy("submittedAt", "desc"),
        startAfter(lastDoc),
        limit(itemsPerPage)
      );
    }
    
    const querySnapshot = await getDocs(assessmentsQuery);
    
    // Check if we've reached the end
    if (querySnapshot.empty) {
      return {
        assessments: [],
        lastDoc: null,
        hasMore: false
      };
    }
    
    // Update the last visible document for pagination
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    const results = querySnapshot.docs.map(mapFirebaseDocToAssessment);
    const processedResults = processAssessmentData(results);
    const uniqueAssessments = removeDuplicateSubmissions(processedResults);
    
    console.log(`Fetched ${uniqueAssessments.length} assessments (page size: ${itemsPerPage})`);
    
    return {
      assessments: uniqueAssessments,
      lastDoc: lastVisible,
      hasMore: querySnapshot.docs.length >= itemsPerPage
    };
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw error;
  }
};
