
import React from "react";
import { EyeOff } from "lucide-react";

interface FocusWarningProps {
  visible: boolean;
}

const FocusWarning: React.FC<FocusWarningProps> = ({ visible }) => {
  if (!visible) return null;
  
  return (
    <div className="mb-4 p-3 text-sm flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-md">
      <EyeOff className="h-4 w-4 text-amber-600" />
      <span className="text-amber-800">
        <strong>Focus tracking active:</strong> Leaving this window or switching tabs is being monitored and may be flagged as suspicious activity.
      </span>
    </div>
  );
};

export default FocusWarning;
