
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
  const [lastVisibleByPage, setLastVisibleByPage] = useState<{[page: number]: QueryDocumentSnapshot | null}>({1: null});
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const itemsPerPage = 10;
  
  const fetchAssessments = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      
      // Determine the starting point for this page
      const startDoc = page === 1 ? null : lastVisibleByPage[page - 1] || null;
      
      if (page > 1 && !startDoc) {
        console.error(`No starting document found for page ${page}`);
        // We need to fetch the previous page first to get its last document
        await fetchAssessments(page - 1);
        return;
      }
      
      const { assessments: newAssessments, lastDoc, hasMore: moreAvailable } = 
        await fetchAssessmentBatch(startDoc, itemsPerPage);
      
      // Store the new assessments
      setAssessments(newAssessments);
      
      // Store the last visible document for the next page
      if (lastDoc) {
        setLastVisibleByPage(prev => ({...prev, [page]: lastDoc}));
        
        // We have more pages if there are more results
        setHasNextPage(moreAvailable);
        
        // Update total pages estimate
        if (moreAvailable) {
          setTotalPages(Math.max(totalPages, page + 1));
        } else {
          setTotalPages(page);
        }
      } else {
        setHasNextPage(false);
        setTotalPages(page);
      }
      
      // Calculate benchmarks with the assessments
      if (newAssessments.length > 0) {
        const benchmarks = calculateBenchmarks(newAssessments);
        console.log('Calculated benchmarks for page', page, benchmarks);
      }
      
      setCurrentPage(page);
    } catch (error) {
      console.error("Error in fetchAssessments:", error);
    } finally {
      setLoading(false);
    }
  }, [lastVisibleByPage, totalPages]);

  // Initial load
  useEffect(() => {
    fetchAssessments(1);
  }, []);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages + (hasNextPage ? 1 : 0)) {
      return;
    }
    
    if (pageNumber === currentPage) {
      return;
    }
    
    fetchAssessments(pageNumber);
  };

  // Filter assessments based on search term
  const filteredAssessments = assessments.filter((assessment) => 
    assessment.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.candidatePosition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Use the filtered assessments (for the current page only)
  const currentItems = filteredAssessments;
  
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
    hasNextPage
  };
};
