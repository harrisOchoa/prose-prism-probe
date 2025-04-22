
import { useState, useEffect } from "react";
import { getAllAssessments } from "@/firebase/assessmentService";
import { calculateBenchmarks } from "@/utils/benchmarkCalculations";

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
        
        // Log the raw data from Firebase to see if aptitude scores are present
        console.log("Raw assessment data from Firebase:", results);
        
        // Make sure aptitudeScore and aptitudeTotal have proper values
        const processedResults = results.map(assessment => {
          // Set default values if they don't exist
          if (assessment.aptitudeScore === undefined || assessment.aptitudeScore === null) {
            console.log(`Assessment ${assessment.id} has missing aptitude score`);
            return {
              ...assessment,
              aptitudeScore: 0,
              aptitudeTotal: assessment.aptitudeTotal || 30
            };
          }
          return assessment;
        });
        
        setAssessments(processedResults);
        
        // Calculate benchmarks from actual assessment data
        const benchmarks = calculateBenchmarks(processedResults);
        console.log('Calculated benchmarks:', benchmarks);
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
    getScoreColor,
    assessments // Expose assessments data for use in other components
  };
};
