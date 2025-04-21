
import React from "react";
import { AlertTriangle, Flag, ClipboardCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";

interface Props {
  analysis: {
    risk: string;
    concerns: string[];
    recommendations: string[];
  };
  metrics: AntiCheatingMetrics & { suspiciousActivityDetail?: string };
}

const AntiCheatingReview: React.FC<Props> = ({ analysis, metrics }) => {
  const hasSpecificSuspiciousActivity = metrics.suspiciousActivity && metrics.suspiciousActivityDetail;

  return (
    <div className="mt-4 p-6 rounded-lg bg-red-50 border border-red-200">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-red-900 text-lg mb-2">Assessment Integrity Review</h4>
          <p className="text-sm text-red-800 leading-relaxed">{analysis.risk}</p>
          {hasSpecificSuspiciousActivity && (
            <div className="mt-3 p-3 bg-red-100 rounded-md text-sm text-red-800">
              <strong>Suspicious Activity Details:</strong> {metrics.suspiciousActivityDetail}
            </div>
          )}
        </div>
      </div>

      <Separator className="my-4 bg-red-200" />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-900">
            <Flag className="h-5 w-5" />
            <h5 className="font-medium">Key Concerns</h5>
          </div>
          <ul className="space-y-2">
            {analysis.concerns && analysis.concerns.length > 0 ? (
              analysis.concerns.map((concern, index) => (
                <li key={index} className="text-sm text-red-800 flex gap-2 items-start">
                  <span className="text-red-400 mt-1">•</span>
                  <span>{concern}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-red-800">No additional concerns identified beyond the suspicious activity flag.</li>
            )}
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-900">
            <ClipboardCheck className="h-5 w-5" />
            <h5 className="font-medium">Recommendations</h5>
          </div>
          <ul className="space-y-2">
            {analysis.recommendations && analysis.recommendations.length > 0 ? (
              analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-red-800 flex gap-2 items-start">
                  <span className="text-red-400 mt-1">•</span>
                  <span>{recommendation}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-red-800">No specific recommendations provided by AI.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AntiCheatingReview;

