
import React, { useEffect, Suspense, lazy } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ViewError from "@/components/assessment/ViewError";
import ViewLoader from "@/components/assessment/ViewLoader";
import { useAssessmentView } from "@/hooks/useAssessmentView";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

// Lazy load the AssessmentDetails component
const AssessmentDetails = lazy(() => 
  import("@/components/AssessmentDetails")
);

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    assessment, 
    loading, 
    error, 
    generatingSummary, 
    setAssessment, 
    refreshAssessment 
  } = useAssessmentView(id);
  const isMobile = useIsMobile();
  
  // Get current tab from URL parameters or default to "overview"
  const currentTab = searchParams.get("tab") || "overview";

  // Set tab to overview if not specified
  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({ tab: "overview" });
    }
  }, [searchParams, setSearchParams]);

  // Show toast about anti-cheating metrics if they exist
  useEffect(() => {
    if (assessment?.antiCheatingMetrics) {
      // Check if metrics exist and are not null
      if (
        assessment.antiCheatingMetrics.tabSwitches > 0 || 
        assessment.antiCheatingMetrics.suspiciousActivity
      ) {
        toast({
          title: "Assessment Integrity Note",
          description: "This assessment has integrity monitoring data available. Check the overview tab.",
          variant: "default",
        });
      }
    }
  }, [assessment]);

  // Before navigating back, refresh the assessment data
  const handleBack = async () => {
    try {
      if (refreshAssessment) {
        await refreshAssessment();
      }
    } catch (error) {
      console.error("Error refreshing before navigation:", error);
    }
    // Navigate back to admin while preserving the tab the user was on
    navigate('/admin');
  };

  if (loading) {
    return <ViewLoader />;
  }

  if (error) {
    return <ViewError error={error} />;
  }

  return (
    <div className={`container mx-auto ${isMobile ? 'py-4 px-2' : 'py-10 px-4'}`}>
      {assessment ? (
        <Suspense fallback={<ViewLoader />}>
          <AssessmentDetails 
            assessment={assessment} 
            onBack={handleBack} 
            isGeneratingSummary={generatingSummary}
            refreshAssessment={refreshAssessment}
          />
        </Suspense>
      ) : (
        <div className="text-center">
          <p>No assessment found with ID: {id}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" 
            onClick={() => navigate('/admin')}
          >
            Back to Admin
          </button>
        </div>
      )}
    </div>
  );
};

export default View;
