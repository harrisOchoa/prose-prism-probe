
import React, { useEffect, useState } from "react";
import { makeGeminiRequest } from "@/services/gemini/config";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";
import AntiCheatingSkeleton from "./AntiCheatingSkeleton";
import AntiCheatingError from "./AntiCheatingError";
import AntiCheatingReview from "./AntiCheatingReview";

interface AntiCheatingAnalysisProps {
  metrics: AntiCheatingMetrics & { 
    suspiciousActivityDetail?: string;
    copyAttempts?: number;
    pasteAttempts?: number;
    windowBlurs?: number;
    windowFocuses?: number;
    rightClickAttempts?: number;
    keyboardShortcuts?: number;
  };
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
        const prompt = `
Candidate Assessment Integrity Review

Your task is to provide a professional, objective analysis for human reviewers regarding the integrity of a candidate's assessment session, based entirely and only on the provided metrics.

Assessment Metrics:
- Total Keystrokes: ${metrics.keystrokes}
- Typing Pauses: ${metrics.pauses}
- Typing Speed (WPM): ${metrics.wordsPerMinute}
- Tab Switches: ${metrics.tabSwitches}
- Copy Attempts: ${metrics.copyAttempts || 0}
- Paste Attempts: ${metrics.pasteAttempts || 0}
- Right-Click Menu Attempts: ${metrics.rightClickAttempts || 0}
- Keyboard Shortcut Uses: ${metrics.keyboardShortcuts || 0}
- Window Blur Events: ${metrics.windowBlurs || 0}
- Window Focus Events: ${metrics.windowFocuses || 0}
- Suspicious Activity Flag: ${metrics.suspiciousActivity ? "Detected" : "Not Detected"}
- Suspicious Activity Detail: ${metrics.suspiciousActivityDetail || "Not specified"}

Instructions:
1. Base your interpretation exclusively on these metric values. Do NOT provide concerns or recommendations unless they are warranted by the _actual_ data.
2. If all metric values are within a reasonable and professional range, clearly state there are no significant integrity risks found.
3. If the Suspicious Activity Flag is "Detected", explain EXACTLY what triggered it based on the Suspicious Activity Detail provided. Be specific about what activity was detected and why it's considered suspicious.
4. For other unusual values, explain specifically what is concerning and why:
   - WPM over 100 may suggest unusually fast typing or text generation
   - Multiple tab switches may indicate looking up answers
   - Copy/paste attempts suggest potential plagiarism
   - Right-click menu attempts may indicate attempts to access browser tools
   - Keyboard shortcuts may indicate attempts to use browser functions
5. Directly relate each concern/recommendation to a specific metric value—never include boilerplate or template responses.
6. Only include concerns that are truly warranted by the data. If there are no legitimate concerns, state this clearly and provide an empty concerns array.
7. Be specific in your recommendations for addressing any issues, such as:
   - Follow-up interview questions to verify knowledge
   - Additional skills verification
   - Manual review of responses

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
    return <AntiCheatingSkeleton />;
  }

  if (error) {
    return <AntiCheatingError error={error} metrics={metrics} />;
  }

  if (!analysis) return null;

  return <AntiCheatingReview analysis={analysis} metrics={metrics} />;
};

export default AntiCheatingAnalysis;
