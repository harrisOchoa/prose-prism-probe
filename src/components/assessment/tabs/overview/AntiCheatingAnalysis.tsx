
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
          Professional Candidate Assessment Integrity Analysis:

          Context:
          - Total Keystrokes: ${metrics.keystrokes} (suggests continuous engagement)
          - Typing Pauses: ${metrics.pauses} (moderate interruption pattern)
          - Typing Speed: ${metrics.wordsPerMinute} WPM (standard professional typing range)
          - Tab Switches: ${metrics.tabSwitches} (potential resource checking concern)
          - Suspicious Activity Flag: ${metrics.suspiciousActivity}

          Detailed Analysis Requirements:
          1. Assess the potential risks to fair candidate evaluation
          2. Explain professional concerns about zero tab switches
          3. Identify potential methods of assessment integrity breach
          4. Maintain a neutral, objective hiring perspective
          5. Provide actionable insights for the hiring team

          Craft a professional, concise analysis explaining the assessment integrity flags, focusing on maintaining a fair evaluation process for all candidates.
        `;

        const analysisResult = await makeGeminiRequest(prompt, 0.2);
        setAnalysis(analysisResult);
      } catch (error) {
        console.error("Error getting anti-cheating analysis:", error);
        setAnalysis("Unable to generate a comprehensive assessment integrity analysis at this time.");
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
    <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 text-red-500 mt-1" />
        <div>
          <h4 className="font-medium text-red-900 mb-2">Assessment Integrity Review</h4>
          <p className="text-sm text-red-800">{analysis}</p>
        </div>
      </div>
    </div>
  );
};

export default AntiCheatingAnalysis;

