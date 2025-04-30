import { useState, useEffect, useCallback } from "react";
import { query, collection, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { calculateBenchmarks } from "@/utils/benchmarkCalculations";

export const useAdminDashboard = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 10;
  
  const fetchAssessments = useCallback(async (isFirstPage = false) => {
    try {
      setLoading(true);
      
      let assessmentsQuery;
      
      if (isFirstPage) {
        // First page query
        assessmentsQuery = query(
          collection(db, "assessments"),
          orderBy("submittedAt", "desc"),
          limit(itemsPerPage)
        );
      } else {
        // Subsequent pages - use pagination with startAfter
        if (!lastVisible) {
          setHasMore(false);
          setLoading(false);
          return;
        }
        
        assessmentsQuery = query(
          collection(db, "assessments"),
          orderBy("submittedAt", "desc"),
          startAfter(lastVisible),
          limit(itemsPerPage)
        );
      }
      
      const querySnapshot = await getDocs(assessmentsQuery);
      
      // Check if we've reached the end
      if (querySnapshot.empty) {
        setHasMore(false);
        setLoading(false);
        return;
      }
      
      // Update the last visible document for pagination
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log("Raw assessment data from Firebase:", results);
      
      const processedResults = results.map(assessment => {
        if (assessment.aptitudeScore !== undefined && assessment.aptitudeScore !== null) {
          console.log(`Assessment ${assessment.id} has aptitude score: ${assessment.aptitudeScore}`);
          return assessment;
        }
        
        if (assessment.aptitudeAnswers && Array.isArray(assessment.aptitudeAnswers)) {
          console.log(`Assessment ${assessment.id} has aptitude answers array of length: ${assessment.aptitudeAnswers.length}`);
          const recoveredScore = assessment.aptitudeAnswers.filter(a => a !== 0).length;
          console.log(`Recovered score for ${assessment.id}: ${recoveredScore}`);
          
          return {
            ...assessment,
            aptitudeScore: recoveredScore,
            aptitudeTotal: assessment.aptitudeTotal || 30
          };
        }
        
        if (assessment.aptitudeData && assessment.aptitudeData.correctAnswers !== undefined) {
          console.log(`Assessment ${assessment.id} has aptitude data with correct answers: ${assessment.aptitudeData.correctAnswers}`);
          return {
            ...assessment,
            aptitudeScore: assessment.aptitudeData.correctAnswers,
            aptitudeTotal: assessment.aptitudeTotal || 30
          };
        }
        
        console.log(`Assessment ${assessment.id} has missing aptitude score and no recoverable data`);
        return {
          ...assessment,
          aptitudeScore: 0,
          aptitudeTotal: assessment.aptitudeTotal || 30
        };
      });
      
      const uniqueAssessments = removeDuplicateSubmissions(processedResults);
      console.log(`Filtered ${processedResults.length - uniqueAssessments.length} duplicate submissions`);
      
      if (isFirstPage) {
        setAssessments(uniqueAssessments);
      } else {
        setAssessments(prev => [...prev, ...uniqueAssessments]);
      }
      
      const benchmarks = calculateBenchmarks([...assessments, ...uniqueAssessments]);
      console.log('Calculated benchmarks:', benchmarks);
    } catch (error) {
      console.error("Error fetching assessments:", error);
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

  const removeDuplicateSubmissions = (assessments: any[]): any[] => {
    const groupedByName = assessments.reduce((groups: {[key: string]: any[]}, assessment) => {
      const key = assessment.candidateName;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(assessment);
      return groups;
    }, {});
    
    const uniqueAssessments: any[] = [];
    
    Object.values(groupedByName).forEach((group: any[]) => {
      const sortedGroup = [...group].sort((a, b) => {
        const dateA = a.submittedAt?.toDate?.() ?? new Date(0);
        const dateB = b.submittedAt?.toDate?.() ?? new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      const filtered: any[] = [];
      sortedGroup.forEach(assessment => {
        const isDuplicate = filtered.some(kept => {
          if (kept.candidatePosition !== assessment.candidatePosition) return false;
          if (kept.aptitudeScore !== assessment.aptitudeScore) return false;
          if (Math.abs(kept.wordCount - assessment.wordCount) > 5) return false;
          const keptDate = kept.submittedAt?.toDate?.() ?? new Date(0);
          const currDate = assessment.submittedAt?.toDate?.() ?? new Date(0);
          return Math.abs(keptDate - currDate) < 2 * 60 * 1000;
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

  // Paginate filtered assessments (client-side)
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
    assessments,
    hasMore,
    loadMore
  };
};
