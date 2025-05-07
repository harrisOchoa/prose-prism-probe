
import { AnalysisStatus } from "@/firebase/services/assessment/types";

// Progress tracking interface
export interface AnalysisProgress {
  status: AnalysisStatus;
  error?: string;
  completedSteps: string[];
  failedSteps: string[];
}
