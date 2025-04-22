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
        
        // Process each assessment to ensure aptitude scores are properly set
        const processedResults = results.map(assessment => {
          // For assessments with existing aptitude score, keep it
          if (assessment.aptitudeScore !== undefined && assessment.aptitudeScore !== null) {
            console.log(`Assessment ${assessment.id} has aptitude score: ${assessment.aptitudeScore}`);
            return assessment;
          }
          
          // Try to recover aptitude score from aptitudeAnswers if available
          if (assessment.aptitudeAnswers && Array.isArray(assessment.aptitudeAnswers)) {
            console.log(`Assessment ${assessment.id} has aptitude answers array of length: ${assessment.aptitudeAnswers.length}`);
            // Count correct answers (non-zero entries in the array)
            const recoveredScore = assessment.aptitudeAnswers.filter(a => a !== 0).length;
            console.log(`Recovered score for ${assessment.id}: ${recoveredScore}`);
            
            return {
              ...assessment,
              aptitudeScore: recoveredScore,
              aptitudeTotal: assessment.aptitudeTotal || 30
            };
          }
          
          // If no score or answers, check if there's any aptitude data
          if (assessment.aptitudeData && assessment.aptitudeData.correctAnswers !== undefined) {
            console.log(`Assessment ${assessment.id} has aptitude data with correct answers: ${assessment.aptitudeData.correctAnswers}`);
            return {
              ...assessment,
              aptitudeScore: assessment.aptitudeData.correctAnswers,
              aptitudeTotal: assessment.aptitudeTotal || 30
            };
          }
          
          // Set default values as last resort
          console.log(`Assessment ${assessment.id} has missing aptitude score and no recoverable data`);
          return {
            ...assessment,
            aptitudeScore: 0,
            aptitudeTotal: assessment.aptitudeTotal || 30
          };
        });
        
        // Remove duplicate submissions (same candidate, position, score within 2 minutes)
        const uniqueAssessments = removeDuplicateSubmissions(processedResults);
        console.log(`Filtered ${processedResults.length - uniqueAssessments.length} duplicate submissions`);
        
        setAssessments(uniqueAssessments);
        
        // Calculate benchmarks from actual assessment data
        const benchmarks = calculateBenchmarks(uniqueAssessments);
        console.log('Calculated benchmarks:', benchmarks);
      } catch (error) {
        console.error("Error fetching assessments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  // Helper function to remove duplicate submissions
  const removeDuplicateSubmissions = (assessments: any[]): any[] => {
    // Group assessments by candidate name
    const groupedByName = assessments.reduce((groups: {[key: string]: any[]}, assessment) => {
      const key = assessment.candidateName;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(assessment);
      return groups;
    }, {});
    
    // For each group, filter out potential duplicates
    const uniqueAssessments: any[] = [];
    Object.values(groupedByName).forEach(group => {
      // Sort by submission date, newest first
      const sortedGroup = [...group].sort((a, b) => {
        const dateA = a.submittedAt && a.submittedAt.toDate ? a.submittedAt.toDate().getTime() : 0;
        const dateB = b.submittedAt && b.submittedAt.toDate ? b.submittedAt.toDate().getTime() : 0;
        return dateB - dateA;
      });
      
      // Keep truly unique submissions and filter duplicates
      const filtered: any[] = [];
      sortedGroup.forEach(assessment => {
        // Check if this is a duplicate of one we've already kept
        const isDuplicate = filtered.some(kept => {
          // Skip if positions don't match
          if (kept.candidatePosition !== assessment.candidatePosition) return false;
          
          // Skip if aptitude scores don't match
          if (kept.aptitudeScore !== assessment.aptitudeScore) return false;
          
          // Skip if word counts are significantly different
          if (Math.abs(kept.wordCount - assessment.wordCount) > 5) return false;
          
          // Check if submission times are within 2 minutes of each other
          const keptDate = kept.submittedAt && kept.submittedAt.toDate ? kept.submittedAt.toDate().getTime() : 0;
          const currDate = assessment.submittedAt && assessment.submittedAt.toDate ? assessment.submittedAt.toDate().getTime() : 0;
          return Math.abs(keptDate - currDate) < 2 * 60 * 1000; // 2 minutes in milliseconds
        });
        
        if (!isDuplicate) {
          filtered.push(assessment);
        }
      });
      
      uniqueAssessments.push(...filtered);
    });
    
    return uniqueAssessments;
  };

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
