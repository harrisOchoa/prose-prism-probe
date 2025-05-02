
import React from "react";
import { AlertTriangle } from "lucide-react";

interface AIDetectionWarningProps {
  aiDetection: {
    probability: number;
    notes?: string;
  };
  showWarning: boolean;
}

const AIDetectionWarning: React.FC<AIDetectionWarningProps> = ({ 
  aiDetection, 
  showWarning 
}) => {
  if (!showWarning) return null;
  
  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
      <div className="flex items-center gap-2 text-yellow-700">
        <AlertTriangle size={20} />
        <span className="font-semibold">Potential AI-Generated Content Detected</span>
      </div>
      {aiDetection.notes && (
        <p className="mt-2 text-sm text-yellow-600">{aiDetection.notes}</p>
      )}
    </div>
  );
};

export default AIDetectionWarning;
