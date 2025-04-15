
import React from "react";
import AdvancedAnalysisContent from "./advanced-analysis/AdvancedAnalysisContent";

interface AdvancedAnalysisTabProps {
  assessmentData: any;
  getProgressColor: (value: number) => string;
  generateAdvancedAnalysis: (analysisType: string) => Promise<any>;
  generatingAnalysis: {[key: string]: boolean};
}

const AdvancedAnalysisTab: React.FC<AdvancedAnalysisTabProps> = ({
  assessmentData,
  getProgressColor,
  generateAdvancedAnalysis,
  generatingAnalysis
}) => {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-2">Advanced Candidate Analysis</h2>
        <p className="text-gray-600">
          This section provides in-depth analysis of the candidate's writing samples and assessment data. 
          The analysis is generated using AI and should be used as supplemental information alongside 
          the candidate's scores and other assessment results.
        </p>
      </div>
      
      <AdvancedAnalysisContent 
        assessmentData={assessmentData}
        getProgressColor={getProgressColor}
        generateAdvancedAnalysis={generateAdvancedAnalysis}
        generatingAnalysis={generatingAnalysis}
      />
      
      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> These analyses are based solely on assessment data and should be considered 
          as additional insights rather than definitive evaluations. Always combine these results with other 
          assessment methods and interview feedback for a comprehensive evaluation.
        </p>
      </div>
    </div>
  );
};

export default AdvancedAnalysisTab;
