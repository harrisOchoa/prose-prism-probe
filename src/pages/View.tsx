
import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import AssessmentDetails from "@/components/AssessmentDetails";
import ViewError from "@/components/assessment/ViewError";
import ViewLoader from "@/components/assessment/ViewLoader";
import { useAssessmentView } from "@/hooks/useAssessmentView";

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { assessment, loading, error, generatingSummary, setAssessment } = useAssessmentView(id);
  
  // Get current tab from URL parameters
  const currentTab = searchParams.get("tab") || "overview";

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
