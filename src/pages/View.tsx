
import React, { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import AssessmentDetails from "@/components/AssessmentDetails";
import ViewError from "@/components/assessment/ViewError";
import ViewLoader from "@/components/assessment/ViewLoader";
import { useAssessmentView } from "@/hooks/useAssessmentView";
import { toast } from "@/hooks/use-toast";

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { assessment, loading, error, generatingSummary, setAssessment } = useAssessmentView(id);
  
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

  const handleBack = () => {
    // Navigate back to admin while preserving the tab the user was on
    navigate('/admin');
  };

  if (loading) {
    return <ViewLoader />;
  }

  if (error) {
    return <ViewError error={error} />;
  }

  // Log assessment data to debug anti-cheating metrics
  if (assessment) {
    console.log("Assessment data in View:", assessment);
    console.log("Anti-cheating metrics:", assessment.antiCheatingMetrics);
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {assessment ? (
        <AssessmentDetails 
          assessment={assessment} 
          onBack={handleBack} 
          isGeneratingSummary={generatingSummary}
        />
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
