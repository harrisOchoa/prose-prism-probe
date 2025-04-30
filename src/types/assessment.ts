
import { QueryDocumentSnapshot } from "firebase/firestore";

export interface AssessmentData {
  id: string;
  candidateName: string;
  candidatePosition: string;
  aptitudeScore?: number;
  aptitudeTotal?: number;
  aptitudeAnswers?: any[];
  aptitudeData?: {
    correctAnswers?: number;
  };
  wordCount: number;
  overallWritingScore?: number;
  submittedAt: any;
}

export interface AssessmentPaginationState {
  lastVisible: QueryDocumentSnapshot | null;
  hasMore: boolean;
  loading: boolean;
}

export interface AssessmentFilters {
  searchTerm: string;
  currentPage: number;
}
