
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useAssessmentDetailsState = (assessment: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Provide safe defaults when assessment is null
  const [assessmentData, setAssessmentData] = useState(assessment || null);
  const [renderKey, setRenderKey] = useState(Date.now().toString());
  
  // Get activeTab from URL query parameter or default to "overview"
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") || "overview";
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Add debugging for null assessment
  if (!assessment) {
    console.log("Assessment is null in useAssessmentDetailsState");
  }

  // Update local state when assessment prop changes
  useEffect(() => {
    if (assessment && JSON.stringify(assessment) !== JSON.stringify(assessmentData)) {
      console.log("Assessment prop updated, updating local state");
      setAssessmentData(assessment);
      // Force re-render of components
      setRenderKey(Date.now().toString());
    } else if (!assessment && assessmentData) {
      // Handle case where assessment becomes null
      console.log("Assessment became null, clearing local state");
      setAssessmentData(null);
      setRenderKey(Date.now().toString());
    }
  }, [assessment, assessmentData]);
  
  // Update URL when tab changes
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    navigate(`${location.pathname}?tab=${value}`, { replace: true });
    // Force re-render when changing tabs
    setRenderKey(Date.now().toString());
  }, [location.pathname, navigate]);

  return {
    assessmentData,
    setAssessmentData,
    renderKey,
    setRenderKey,
    activeTab,
    handleTabChange
  };
};
