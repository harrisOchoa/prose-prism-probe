
import { useState, useEffect } from "react";
import { getAllAssessments } from "@/firebase/services/assessment/assessmentQuery";
import { AssessmentData } from "@/types/assessment";

export interface CandidateData {
  id: string;
  name: string;
  position: string;
  submissions: number;
  latestSubmission: Date;
  averageScore?: number;
}

export const useAdminCandidates = () => {
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const assessments = await getAllAssessments();
        
        // Group assessments by candidate name and position
        const candidateMap = new Map<string, CandidateData>();
        
        assessments.forEach(assessment => {
          if (!assessment.candidateName || !assessment.candidatePosition) {
            return;
          }
          
          const key = `${assessment.candidateName}-${assessment.candidatePosition}`;
          
          if (candidateMap.has(key)) {
            const candidate = candidateMap.get(key)!;
            candidate.submissions++;
            
            // Update latest submission date if this one is newer
            const submissionDate = assessment.submittedAt?.toDate?.() ?? new Date();
            if (submissionDate > candidate.latestSubmission) {
              candidate.latestSubmission = submissionDate;
            }
            
            // Update average score calculation
            const totalScore = (candidate.averageScore || 0) * (candidate.submissions - 1);
            const assessmentScore = assessment.overallWritingScore || 
                                   (assessment.aptitudeScore ? assessment.aptitudeScore / (assessment.aptitudeTotal || 30) * 5 : 0);
            candidate.averageScore = (totalScore + assessmentScore) / candidate.submissions;
          } else {
            const assessmentScore = assessment.overallWritingScore || 
                                   (assessment.aptitudeScore ? assessment.aptitudeScore / (assessment.aptitudeTotal || 30) * 5 : 0);
            
            candidateMap.set(key, {
              id: key,
              name: assessment.candidateName,
              position: assessment.candidatePosition,
              submissions: 1,
              latestSubmission: assessment.submittedAt?.toDate?.() ?? new Date(),
              averageScore: assessmentScore || undefined
            });
          }
        });
        
        const candidateList = Array.from(candidateMap.values());
        setCandidates(candidateList);
      } catch (err) {
        console.error("Error fetching candidates:", err);
        setError("Failed to load candidates");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidates();
  }, []);

  // Filter candidates based on search term
  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    candidates: filteredCandidates,
    loading,
    error,
    searchTerm,
    setSearchTerm
  };
};
