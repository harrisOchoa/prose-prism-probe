
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
          Deeply analyze these assessment integrity metrics and provide a comprehensive explanation for potential suspicious activity:
          
          Context:
          - Total Keystrokes: 1974 (seems consistent)
          - Typing Pauses: 24 (moderate number)
          - Typing Speed: 50 WPM (generally normal)
          - Tab Switches: 0 (unusual)
          - Suspicious Activity Flag: Yes

          Detailed Analysis Requirements:
          1. Explain why zero tab switches might be considered suspicious
          2. Discuss potential scenarios of academic dishonesty
          3. Provide insights into what makes this assessment integrity profile unusual
          4. Use a professional, objective tone
          5. Focus on the specific combination of metrics that triggered the suspicious activity flag

          Your analysis should be 3-4 sentences long, explaining the nuanced reasons behind the suspicious activity detection.
        `;

        const analysisResult = await makeGeminiRequest(prompt, 0.2);
        setAnalysis(analysisResult);
      } catch (error) {
        console.error("Error getting anti-cheating analysis:", error);
        setAnalysis("Unable to generate a comprehensive analysis at this time.");
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
          <h4 className="font-medium text-red-900 mb-2">Detailed Integrity Analysis</h4>
          <p className="text-sm text-red-800">{analysis}</p>
        </div>
      </div>
    </div>
  );
};

export default AntiCheatingAnalysis;
