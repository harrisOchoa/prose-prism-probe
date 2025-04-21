
import React from "react";
import { scoringCriteria } from "@/services/gemini/types";

interface ScoringSummaryProps {
  overallWritingScore: number;
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
  getScoreLabel: (score: number) => string;
}

const ScoringSummary: React.FC<ScoringSummaryProps> = ({
  overallWritingScore,
  getScoreColor,
  getScoreBgColor,
  getScoreLabel
}) => {
  // Find explanation string
  const explanation =
    (Object.entries(scoringCriteria)
      .find(([score]) => Math.floor(overallWritingScore) === parseInt(score))?.[1] as React.ReactNode) ||
    "The response quality is between defined scoring levels.";

  return (
    <div className="w-full flex justify-center">
      <div
        className={`flex flex-col md:grid md:grid-cols-[min-content_min-content_1fr] items-stretch w-full max-w-4xl rounded-xl border shadow-sm ${getScoreBgColor(overallWritingScore)} bg-white/90`}
      >
        {/* Left: Score & Rating */}
        <div className="flex flex-row items-center justify-center gap-8 px-7 py-7 md:py-10 border-b md:border-b-0 md:border-r md:min-w-[270px]">
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-sm font-medium mb-1 text-gray-900">Overall Score</h3>
            <p className={`text-3xl md:text-4xl font-extrabold ${getScoreColor(overallWritingScore)}`}>
              {overallWritingScore}/5
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start pl-6 border-l h-full">
            <h3 className="text-sm font-medium mb-1 text-gray-900">Rating</h3>
            <p className={`text-xl md:text-2xl font-semibold ${getScoreColor(overallWritingScore)}`}>
              {getScoreLabel(overallWritingScore)}
            </p>
          </div>
        </div>
        {/* Right: Explanation */}
        <div className="flex flex-col justify-center px-10 py-6 md:py-8">
          <h4 className="font-semibold text-gray-900 mb-2 text-base">What this score means:</h4>
          <p className="text-sm text-gray-800 leading-relaxed">{explanation}</p>
        </div>
      </div>
    </div>
  );
};

export default ScoringSummary;

