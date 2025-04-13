
import React from "react";

interface WritingResponseItemProps {
  prompt: any;
  promptScore: any;
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
}

const WritingResponseItem: React.FC<WritingResponseItemProps> = ({ 
  prompt, 
  promptScore, 
  getScoreColor, 
  getScoreBgColor 
}) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-subtle">
      <div className="bg-gray-50 p-4 border-b flex justify-between items-start">
        <h3 className="text-lg font-medium">{prompt.prompt}</h3>
        
        {promptScore ? (
          <div className={`rounded-full px-3 py-1 text-white font-medium ml-2 ${
            promptScore.score === 0 
              ? "bg-gray-400" 
              : getScoreColor(promptScore.score).replace("text-", "bg-")
          } bg-opacity-90`}>
            {promptScore.score === 0 ? "Not Evaluated" : `${promptScore.score}/5`}
          </div>
        ) : (
          <div className="rounded-full px-3 py-1 text-white font-medium bg-gray-400 bg-opacity-90 ml-2">
            Not Evaluated
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm">
          {prompt.response}
        </div>
        
        {promptScore && (
          <div className={`mt-4 p-3 rounded border ${
            promptScore.score === 0 
              ? "bg-gray-50 border-gray-200" 
              : "bg-blue-50 border-blue-100"
          }`}>
            <p className={`text-sm font-medium ${
              promptScore.score === 0 ? "text-gray-700" : "text-blue-700"
            }`}>
              AI Feedback:
            </p>
            <p className={`text-sm ${
              promptScore.score === 0 ? "text-gray-600" : "text-blue-600"
            }`}>
              {promptScore.feedback}
            </p>
          </div>
        )}
        
        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
          <span>Word count: {prompt.wordCount}</span>
        </div>
      </div>
    </div>
  );
};

export default WritingResponseItem;
