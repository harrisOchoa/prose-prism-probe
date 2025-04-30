
import { useState, useEffect, useCallback } from "react";
import { QueryDocumentSnapshot } from "firebase/firestore";
import { calculateBenchmarks } from "@/utils/benchmarkCalculations";
import { fetchAssessmentBatch } from "@/services/assessmentService";
import { calculateAssessmentStatistics, getScoreColor } from "@/utils/assessmentStatistics";
import { AssessmentData } from "@/types/assessment";

export const useAdminDashboard = () => {
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 10;
  
  const fetchAssessments = useCallback(async (isFirstPage = false) => {
    try {
      setLoading(true);
      
      const { assessments: newAssessments, lastDoc, hasMore: moreAvailable } = 
        await fetchAssessmentBatch(isFirstPage ? null : lastVisible, itemsPerPage);
      
      if (newAssessments.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }
      
      setLastVisible(lastDoc);
      setHasMore(moreAvailable);
      
      if (isFirstPage) {
        setAssessments(newAssessments);
      } else {
        setAssessments(prev => [...prev, ...newAssessments]);
      }
      
      // Calculate benchmarks with all assessments
      const allAssessments = isFirstPage ? newAssessments : [...assessments, ...newAssessments];
      if (allAssessments.length > 0) {
        const benchmarks = calculateBenchmarks(allAssessments);
        console.log('Calculated benchmarks:', benchmarks);
      }
    } catch (error) {
      console.error("Error in fetchAssessments:", error);
    } finally {
      setLoading(false);
    }
  }, [lastVisible, assessments]);

  // Initial load
  useEffect(() => {
    fetchAssessments(true);
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchAssessments(false);
    }
  }, [fetchAssessments, loading, hasMore]);

  // Filter assessments based on search term
  const filteredAssessments = assessments.filter((assessment) => 
    assessment.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.candidatePosition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate filtered assessments (client-side)
  const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssessments.slice(indexOfFirstItem, indexOfLastItem);
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const viewAssessmentDetails = (assessment: AssessmentData) => {
    setSelectedAssessment(assessment);
    setShowDetails(true);
  };

  // Calculate statistics
  const {
    totalAssessments,
    averageAptitudeScore,
    averageWordCount,
    averageWritingScore
  } = calculateAssessmentStatistics(assessments);

  return {
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    currentItems,
    handlePageChange,
    viewAssessmentDetails,
    selectedAssessment,
    showDetails,
    setShowDetails,
    totalAssessments,
    averageAptitudeScore,
    averageWordCount,
    averageWritingScore,
    getScoreColor,
    assessments,
    hasMore,
    loadMore
  };
};
