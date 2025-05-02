
import React from "react";
import AIDetectionWarning from "./AIDetectionWarning";

interface FeedbackSectionProps {
  feedback?: string;
  aiDetection?: {
    probability: number;
    notes?: string;
  };
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ feedback, aiDetection }) => {
  if (!feedback) return null;
  
  const showAiWarning = aiDetection && aiDetection.probability > 0.7;
  
  return (
    <div className="space-y-2">
      <h4 className="text-lg font-semibold">Evaluation Feedback</h4>
      <p className="text-gray-600">{feedback}</p>
      
      {aiDetection && (
        <AIDetectionWarning 
          aiDetection={aiDetection} 
          showWarning={!!showAiWarning}
        />
      )}
    </div>
  );
};

export default FeedbackSection;
