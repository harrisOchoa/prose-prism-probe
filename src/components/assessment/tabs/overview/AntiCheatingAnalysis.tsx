
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

          Format the response as JSON without markdown formatting:
          {
            "risk": "brief risk assessment",
            "concerns": ["concern 1", "concern 2", "concern 3"],
            "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
          }
        `;

        const result = await makeGeminiRequest(prompt, 0.2);
        
        // Handle JSON that might be wrapped in markdown code blocks
        let parsedResult;
        try {
          // First try direct JSON parsing
          parsedResult = JSON.parse(result);
        } catch (parseError) {
          console.log("Direct parsing failed, trying to extract JSON from markdown");
          
          // If direct parsing fails, try to extract JSON from markdown code blocks
          const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            try {
              parsedResult = JSON.parse(jsonMatch[1]);
            } catch (nestedError) {
              console.error("Failed to parse extracted JSON:", nestedError);
              throw new Error("Invalid JSON format in response");
            }
          } else {
            console.error("Could not extract JSON from response");
            throw new Error("No valid JSON found in response");
          }
        }
        
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
            {analysis.concerns && analysis.concerns.length > 0 ? (
              analysis.concerns.map((concern, index) => (
                <li key={index} className="text-sm text-red-800 flex gap-2 items-start">
                  <span className="text-red-400 mt-1">•</span>
                  <span>{concern}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-red-800">No specific concerns identified.</li>
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
              <li className="text-sm text-red-800">No specific recommendations available.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AntiCheatingAnalysis;
