
import React from "react";

interface PromptSectionProps {
  prompt: string;
  score?: number;
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
}

const PromptSection: React.FC<PromptSectionProps> = ({
  prompt,
  score,
  getScoreColor,
  getScoreBgColor
}) => {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h4 className="text-lg font-semibold mb-2">Writing Prompt</h4>
        <p className="text-gray-600">{prompt}</p>
      </div>
      {score !== undefined && (
        <div className={`px-4 py-2 rounded-full ${getScoreBgColor(score)}`}>
          <span className={`text-lg font-bold ${getScoreColor(score)}`}>
            {score.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
};

export default PromptSection;
