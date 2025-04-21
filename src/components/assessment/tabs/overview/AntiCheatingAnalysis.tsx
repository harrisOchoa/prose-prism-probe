
import React, { useEffect, useState } from "react";
import { makeGeminiRequest } from "@/services/gemini/config";
import { Skeleton } from "@/components/ui/skeleton";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";
import { AlertTriangle, Flag, ClipboardCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AntiCheatingAnalysisProps {
  metrics: AntiCheatingMetrics;
}

const AntiCheatingAnalysis: React.FC<AntiCheatingAnalysisProps> = ({ metrics }) => {
  const [analysis, setAnalysis] = useState<{
    risk: string;
    concerns: string[];
    recommendations: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getAnalysis = async () => {
      setError(null);
      try {
        // Create an enhanced prompt that specifically asks for details about suspicious activity
        const prompt = `
Candidate Assessment Integrity Review

Your task is to provide a professional analysis for human reviewers regarding the integrity of a candidate's assessment session, based entirely and only on the provided metrics.

Assessment Metrics:
- Total Keystrokes: ${metrics.keystrokes}
- Typing Pauses: ${metrics.pauses}
- Typing Speed (WPM): ${metrics.wordsPerMinute}
- Tab Switches: ${metrics.tabSwitches}
- Suspicious Activity Flag: ${metrics.suspiciousActivity ? "Detected" : "Not Detected"}
- Suspicious Activity Detail: ${metrics.suspiciousActivityDetail || "Not specified"}

Instructions:
1. Base your interpretation exclusively on these metric values. Do NOT provide concerns or recommendations unless they are warranted by the _actual_ data.
2. If all metric values are within a reasonable and professional range, clearly state there are no significant integrity risks found.
3. If the Suspicious Activity Flag is "Detected", explain EXACTLY what triggered it based on the Suspicious Activity Detail provided. Be specific about what activity was detected and why it's considered suspicious.
4. For other unusual values (e.g. extremely high/low typing speed, large number of pauses, or tab switching rate is atypical), explain specifically what is concerning and why.
5. Directly relate each concern/recommendation to a specific metric value—never include boilerplate or template responses.
6. A value of 0 for tab switches is normal and should NOT be flagged as a concern unless there's a specific reason to expect tab switching in this assessment context.
7. Only include concerns that are truly warranted by the data. If there are no legitimate concerns, state this clearly and provide an empty concerns array.

Response Format (output as plain JSON; no markdown or commentary):
{
  "risk": "Clear, specific summary based entirely on these values, explaining exactly what suspicious activity was detected if applicable.",
  "concerns": [ "Specific concern 1 with detailed explanation...", "Specific concern 2 with detailed explanation..." ],
  "recommendations": [ "Specific recommendation 1...", "Specific recommendation 2..." ]
}
        `;

        const result = await makeGeminiRequest(prompt, 0.2);

        let parsedResult;
        try {
          parsedResult = JSON.parse(result);
        } catch (parseError) {
          // Try extracting JSON from markdown (```json ... ```) if present
          const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            try {
              parsedResult = JSON.parse(jsonMatch[1]);
            } catch (nestedError) {
              console.error("Failed to parse Gemini JSON after extraction:", nestedError);
              setError("Unable to interpret AI response. Please review assessment data manually.");
              setAnalysis(null);
              return;
            }
          } else {
            console.error("Failed to parse Gemini response and extract JSON.");
            setError("Unable to interpret AI response. Please review assessment data manually.");
            setAnalysis(null);
            return;
          }
        }

        if (
          !parsedResult ||
          typeof parsedResult !== "object" ||
          typeof parsedResult.risk !== "string" ||
          !Array.isArray(parsedResult.concerns) ||
          !Array.isArray(parsedResult.recommendations)
        ) {
          setError("AI assessment did not return a complete review. Please review assessment data manually.");
          setAnalysis(null);
          return;
        }

        setAnalysis({
          risk: parsedResult.risk,
          concerns: parsedResult.concerns,
          recommendations: parsedResult.recommendations
        });
      } catch (e) {
        setError("Failed to contact AI reviewer. Please review assessment data manually.");
        setAnalysis(null);
      } finally {
        setLoading(false);
      }
    };

    if (metrics) {
      setLoading(true);
      getAnalysis();
    }
  }, [metrics]);

  if (loading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (error) {
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
  }

  if (!analysis) return null;

  // Special formatting if suspicious activity was detected
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

export default AntiCheatingAnalysis;
