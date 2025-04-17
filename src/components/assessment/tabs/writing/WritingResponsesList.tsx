
import React from "react";
import WritingResponseItem from "./WritingResponseItem";
import WritingResponsesHeader from "./WritingResponsesHeader";

interface WritingResponsesListProps {
  completedPrompts: any[];
  writingScores?: any[];
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
}

const WritingResponsesList: React.FC<WritingResponsesListProps> = ({
  completedPrompts,
  writingScores,
  getScoreColor,
  getScoreBgColor
}) => {
  return (
    <div className="space-y-6">
      <WritingResponsesHeader responsesCount={completedPrompts.length} />
      
      <div className="space-y-6">
        {completedPrompts.map((prompt, index) => {
          const promptScore = writingScores?.find(
            (score) => score.promptId === prompt.id
          );
          
          return (
            <WritingResponseItem
              key={index}
              prompt={prompt}
              promptScore={promptScore}
              getScoreColor={getScoreColor}
              getScoreBgColor={getScoreBgColor}
            />
          );
        })}
      </div>
    </div>
  );
};

export default WritingResponsesList;
