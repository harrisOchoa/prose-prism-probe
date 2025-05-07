
import { useState, useEffect } from "react";
import { getAllAssessments } from "@/firebase/services/assessment/assessmentQuery";
import { AssessmentData } from "@/types/assessment";

export type AssessmentStatus = 'active' | 'completed' | 'archived';

export interface AssessmentWithStatus extends AssessmentData {
  status: AssessmentStatus;
}

export const useAdminAssessments = () => {
  const [assessments, setAssessments] = useState<AssessmentWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | AssessmentStatus>('all');

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const assessmentData = await getAllAssessments();
        
        // Determine status for each assessment
        const processedAssessments = assessmentData.map(assessment => {
          let status: AssessmentStatus = 'completed';
          
          // Check if assessment is recent (< 24 hours) and not fully analyzed
          const submittedAt = assessment.submittedAt?.toDate?.() ?? new Date();
          const isRecent = (Date.now() - submittedAt.getTime()) < 24 * 60 * 60 * 1000;
          const isFullyAnalyzed = assessment.analysisStatus === 'completed';
          
          if (isRecent && !isFullyAnalyzed) {
            status = 'active';
          } else if (assessment.analysisStatus === 'failed' || 
                    (assessment.submittedAt && 
                     submittedAt.getTime() < Date.now() - 90 * 24 * 60 * 60 * 1000)) {
            // Mark as archived if analysis failed or older than 90 days
            status = 'archived';
          }
          
          return {
            ...assessment,
            status
          } as AssessmentWithStatus;
        });
        
        setAssessments(processedAssessments);
      } catch (err) {
        console.error("Error fetching assessments:", err);
        setError("Failed to load assessments");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessments();
  }, []);

  // Filter assessments based on search term and active tab
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = 
      (assessment.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       assessment.candidatePosition?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = activeTab === 'all' || assessment.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  // Count assessments by status
  const counts = {
    active: assessments.filter(a => a.status === 'active').length,
    completed: assessments.filter(a => a.status === 'completed').length,
    archived: assessments.filter(a => a.status === 'archived').length,
    total: assessments.length
  };

  return {
    assessments: filteredAssessments,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    counts
  };
};
