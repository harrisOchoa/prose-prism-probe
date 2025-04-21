
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
  return (
    <div className="w-full flex flex-col md:flex-row gap-6 md:items-stretch">
      {/* Left: Score and Rating */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex flex-row items-start gap-10">
          <div>
            <h3 className="text-lg font-medium">Overall Score</h3>
            <p className={`text-3xl font-bold ${getScoreColor(overallWritingScore)}`}>
              {overallWritingScore}/5
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Rating</h3>
            <p className={`text-xl font-bold ${getScoreColor(overallWritingScore)}`}>
              {getScoreLabel(overallWritingScore)}
            </p>
          </div>
        </div>
      </div>
      {/* Right: Explanation */}
      <div className={`flex-1 p-4 rounded-md ${getScoreBgColor(overallWritingScore)} border md:max-w-[375px]`}>
        <h4 className="font-medium mb-2">What this score means:</h4>
        <p className="text-sm">
          {Object.entries(scoringCriteria)
            .find(([score]) => Math.floor(overallWritingScore) === parseInt(score))?.[1] as React.ReactNode ||
            "The response quality is between defined scoring levels."}
        </p>
      </div>
    </div>
  );
};

export default ScoringSummary;
