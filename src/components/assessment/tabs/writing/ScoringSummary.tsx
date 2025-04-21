
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
      <div className="flex flex-col md:flex-row md:items-center gap-6 w-full max-w-3xl">
        {/* Left: Score and Rating */}
        <div className="flex-1 flex flex-row items-center gap-10 justify-center md:justify-start">
          <div>
            <h3 className="text-base font-medium mb-1 text-gray-900">Overall Score</h3>
            <p className={`text-3xl md:text-4xl font-extrabold ${getScoreColor(overallWritingScore)}`}>
              {overallWritingScore}/5
            </p>
          </div>
          <div className="border-l pl-6">
            <h3 className="text-base font-medium mb-1 text-gray-900">Rating</h3>
            <p className={`text-xl md:text-2xl font-semibold ${getScoreColor(overallWritingScore)}`}>
              {getScoreLabel(overallWritingScore)}
            </p>
          </div>
        </div>
        {/* Right: Explanation */}
        <div
          className={`flex-1 md:max-w-[420px] p-5 border rounded-lg ${getScoreBgColor(overallWritingScore)} bg-white/70 shadow-md`}
        >
          <h4 className="font-semibold text-gray-900 mb-2">What this score means:</h4>
          <p className="text-sm text-gray-800 leading-relaxed">{explanation}</p>
        </div>
      </div>
    </div>
  );
};

export default ScoringSummary;
