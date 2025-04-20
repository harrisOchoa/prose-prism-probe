
import React, { useEffect, useState } from "react";
import { makeGeminiRequest } from "@/services/gemini/config";
import { Skeleton } from "@/components/ui/skeleton";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";
import { AlertTriangle, Flag, Search, ClipboardCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AntiCheatingAnalysisProps {
  metrics: AntiCheatingMetrics;
}

const AntiCheatingAnalysis: React.FC<AntiCheatingAnalysisProps> = ({ metrics }) => {
  const [analysis, setAnalysis] = useState<{
    risk: string;
    concerns: string[];
    recommendations: string[];
  }>({ risk: "", concerns: [], recommendations: [] });
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

          Please provide a structured analysis with:
          1. A brief risk assessment summary (2 sentences)
          2. Three specific integrity concerns
          3. Three actionable recommendations for the hiring team

          Format the response as JSON:
          {
            "risk": "brief risk assessment",
            "concerns": ["concern 1", "concern 2", "concern 3"],
            "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
          }
        `;

        const result = await makeGeminiRequest(prompt, 0.2);
        const parsedResult = JSON.parse(result);
        setAnalysis(parsedResult);
      } catch (error) {
        console.error("Error getting anti-cheating analysis:", error);
        setAnalysis({
          risk: "Unable to generate a comprehensive assessment integrity analysis at this time.",
          concerns: [],
          recommendations: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (metrics) {
      getAnalysis();
    }
  }, [metrics]);

  if (loading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="mt-4 p-6 rounded-lg bg-red-50 border border-red-200">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-red-900 text-lg mb-2">Assessment Integrity Review</h4>
          <p className="text-sm text-red-800 leading-relaxed">{analysis.risk}</p>
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
            {analysis.concerns.map((concern, index) => (
              <li key={index} className="text-sm text-red-800 flex gap-2 items-start">
                <span className="text-red-400 mt-1">•</span>
                <span>{concern}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-900">
            <ClipboardCheck className="h-5 w-5" />
            <h5 className="font-medium">Recommendations</h5>
          </div>
          <ul className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-red-800 flex gap-2 items-start">
                <span className="text-red-400 mt-1">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AntiCheatingAnalysis;
