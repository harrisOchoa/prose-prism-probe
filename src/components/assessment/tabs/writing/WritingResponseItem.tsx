
import React from "react";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

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
  const aiProbability = promptScore?.aiDetection?.probability || 0;
  const showAiWarning = aiProbability > 0.7; // 70% threshold for AI detection warning

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-lg font-semibold mb-2">Writing Prompt</h4>
            <p className="text-gray-600">{prompt.prompt}</p>
          </div>
          {promptScore && (
            <div className={`px-4 py-2 rounded-full ${getScoreBgColor(promptScore.score)}`}>
              <span className={`text-lg font-bold ${getScoreColor(promptScore.score)}`}>
                {promptScore.score.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-2">Response</h4>
          <p className="whitespace-pre-wrap text-gray-600">{prompt.response}</p>
        </div>

        {promptScore && (
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Evaluation Feedback</h4>
            <p className="text-gray-600">{promptScore.feedback}</p>
            
            {showAiWarning && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle size={20} />
                  <span className="font-semibold">Potential AI-Generated Content Detected</span>
                </div>
                <p className="mt-2 text-sm text-yellow-600">{promptScore.aiDetection?.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default WritingResponseItem;
