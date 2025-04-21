
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";

interface Props {
  error: string;
  metrics: AntiCheatingMetrics & { suspiciousActivityDetail?: string };
}

const AntiCheatingError: React.FC<Props> = ({ error, metrics }) => {
  return (
    <div className="mt-4 p-6 rounded-lg bg-amber-50 border border-amber-200">
      <div className="flex items-start gap-3 mb-2">
        <AlertTriangle className="h-6 w-6 text-amber-500 mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-amber-900 text-lg mb-2">Assessment Integrity Review Unavailable</h4>
          <p className="text-sm text-amber-800 leading-relaxed">{error}</p>
        </div>
      </div>
      <Separator className="my-4 bg-amber-200" />
      <div className="text-sm text-amber-800">
        Integrity metrics have been collected for this assessment.
        <br />
        Please review raw data for signs of suspicious behavior.
        {metrics.suspiciousActivity && (
          <>
            <br /><br />
            <strong>Important:</strong> Suspicious activity flag is enabled. 
            {metrics.suspiciousActivityDetail ? (
              <div className="mt-2 p-3 bg-amber-100 rounded-md">
                <strong>Details:</strong> {metrics.suspiciousActivityDetail}
              </div>
            ) : (
              " No specific details were provided about the nature of the suspicious activity."
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AntiCheatingError;

