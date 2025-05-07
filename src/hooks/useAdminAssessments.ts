
import { useState, useEffect } from "react";
import { getAllAssessments } from "@/firebase/services/assessment/assessmentQuery";
import { AssessmentData } from "@/types/assessment";
import { 
  AssessmentStatus, 
  AssessmentWithStatus, 
  addStatusToAssessments, 
  countAssessmentsByStatus 
} from "@/utils/assessmentStatus";

export type { AssessmentStatus, AssessmentWithStatus };

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
        
        // Convert DocumentData[] to AssessmentData[] before processing
        const typedAssessments = assessmentData as unknown as AssessmentData[];
        
        // Process assessments and add status
        const processedAssessments = addStatusToAssessments(typedAssessments);
        
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
  const counts = countAssessmentsByStatus(assessments);

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
