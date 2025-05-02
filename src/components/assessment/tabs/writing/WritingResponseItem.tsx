
import React from "react";
import { Card } from "@/components/ui/card";
import { 
  PromptSection,
  ResponseSection,
  FeedbackSection
} from "./components";

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
    <Card className="p-6">
      <div className="space-y-4">
        <PromptSection 
          prompt={prompt.prompt}
          score={promptScore?.score}
          getScoreColor={getScoreColor}
          getScoreBgColor={getScoreBgColor}
        />

        <ResponseSection response={prompt.response} />

        {promptScore && (
          <FeedbackSection 
            feedback={promptScore.feedback}
            aiDetection={promptScore.aiDetection}
          />
        )}
      </div>
    </Card>
  );
};

export default WritingResponseItem;
