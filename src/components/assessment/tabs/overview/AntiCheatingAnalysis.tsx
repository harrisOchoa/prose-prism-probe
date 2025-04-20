
import React, { useEffect, useState } from "react";
import { makeGeminiRequest } from "@/services/gemini/config";
import { Skeleton } from "@/components/ui/skeleton";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";
import { AlertTriangle } from "lucide-react";

interface AntiCheatingAnalysisProps {
  metrics: AntiCheatingMetrics;
}

const AntiCheatingAnalysis: React.FC<AntiCheatingAnalysisProps> = ({ metrics }) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAnalysis = async () => {
      try {
        const prompt = `
          Analyze these assessment integrity metrics and explain why they might indicate suspicious activity or not:
          - Total Keystrokes: ${metrics.keystrokes}
          - Typing Pauses: ${metrics.pauses}
          - Typing Speed: ${metrics.wordsPerMinute} WPM
          - Tab Switches: ${metrics.tabSwitches}
          - Was marked as suspicious: ${metrics.suspiciousActivity}
          
          Focus on:
          1. Whether the typing speed and pattern seems natural
          2. If the number of pauses is unusual
          3. How the keystroke count relates to the typing speed
          4. What these metrics together suggest about the assessment integrity
          
          Provide a clear, concise explanation in 2-3 sentences about why this might be flagged as suspicious or not.
        `;

        const analysisResult = await makeGeminiRequest(prompt, 0.3);
        setAnalysis(analysisResult);
      } catch (error) {
        console.error("Error getting anti-cheating analysis:", error);
        setAnalysis("Unable to generate analysis at this time.");
      } finally {
        setLoading(false);
      }
    };

    if (metrics) {
      getAnalysis();
    }
  }, [metrics]);

  if (loading) {
    return <Skeleton className="h-20 w-full" />;
  }

  return (
    <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-1" />
        <div>
          <h4 className="font-medium text-amber-900 mb-2">Analysis</h4>
          <p className="text-sm text-amber-800">{analysis}</p>
        </div>
      </div>
    </div>
  );
};

export default AntiCheatingAnalysis;
