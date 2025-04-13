
import { useState, useEffect } from "react";
import { getAllAssessments } from "@/firebase/assessmentService";

export const useAdminDashboard = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const results = await getAllAssessments();
        setAssessments(results);
      } catch (error) {
        console.error("Error fetching assessments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  // Filter assessments based on search term
  const filteredAssessments = assessments.filter((assessment) => 
    assessment.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.candidatePosition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssessments.slice(indexOfFirstItem, indexOfLastItem);
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const viewAssessmentDetails = (assessment: any) => {
    setSelectedAssessment(assessment);
    setShowDetails(true);
  };

  // Calculate statistics
  const totalAssessments = assessments.length;
  const averageAptitudeScore = assessments.length > 0 
    ? (assessments.reduce((sum, assessment) => sum + (assessment.aptitudeScore / assessment.aptitudeTotal * 100), 0) / assessments.length).toFixed(1)
    : 0;
  const averageWordCount = assessments.length > 0
    ? Math.round(assessments.reduce((sum, assessment) => sum + assessment.wordCount, 0) / assessments.length)
    : 0;
  const averageWritingScore = assessments.length > 0 
    ? (assessments.reduce((sum, assessment) => sum + (assessment.overallWritingScore || 0), 0) / 
       assessments.filter(a => a.overallWritingScore).length).toFixed(1)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "text-green-600 font-semibold";
    if (score >= 3.5) return "text-blue-600 font-semibold";
    if (score >= 2.5) return "text-yellow-600 font-semibold";
    if (score >= 1.5) return "text-orange-600 font-semibold";
    return "text-red-600 font-semibold";
  };

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
    getScoreColor
  };
};
