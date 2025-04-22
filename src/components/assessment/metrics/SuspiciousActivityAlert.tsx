
import React from "react";
import { AlertOctagon } from "lucide-react";

interface SuspiciousActivityAlertProps {
  detail: string;
}

const SuspiciousActivityAlert: React.FC<SuspiciousActivityAlertProps> = ({ detail }) => {
  return (
    <div className="mt-2 p-3 border border-red-200 bg-red-50 rounded-md">
      <div className="flex gap-2">
        <AlertOctagon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-red-700 mb-1">Suspicious Activity Details:</p>
          <p className="text-sm text-red-600">{detail}</p>
        </div>
      </div>
    </div>
  );
};

export default SuspiciousActivityAlert;

