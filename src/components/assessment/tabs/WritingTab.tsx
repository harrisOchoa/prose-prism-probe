
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, HelpCircle, Loader2 } from "lucide-react";
import { WritingScore, scoringCriteria } from "@/services/geminiService";
import SkillsRadarChart from "@/components/assessment/SkillsRadarChart";

interface WritingTabProps {
  assessmentData: any;
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
  getScoreLabel: (score: number) => string;
}

// Extract WritingResponseItem into its own component
const WritingResponseItem: React.FC<{
  prompt: any;
  index: number;
  promptScore: any;
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
}> = ({ prompt, index, promptScore, getScoreColor, getScoreBgColor }) => {
  return (
    <div key={index} className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4 border-b flex justify-between items-start">
        <h3 className="text-lg font-medium">{prompt.prompt}</h3>
        
        {promptScore ? (
          <div className={`rounded-full px-3 py-1 text-white font-medium ${
            promptScore.score === 0 
              ? "bg-gray-400" 
              : getScoreColor(promptScore.score).replace("text-", "bg-")
          } bg-opacity-90`}>
            {promptScore.score === 0 ? "Not Evaluated" : `${promptScore.score}/5`}
          </div>
        ) : (
          <div className="rounded-full px-3 py-1 text-white font-medium bg-gray-400 bg-opacity-90">
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

// Extract ScoreDistribution into its own component
const ScoreDistribution: React.FC<{
  writingScores: WritingScore[];
}> = ({ writingScores }) => {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-medium mb-3">Score Distribution</h4>
      <div className="space-y-3">
        {[...Array(5)].map((_, idx) => {
          const score = 5 - idx;
          const count = writingScores.filter(
            (s: WritingScore) => Math.floor(s.score) === score
          ).length;
          const percentage = writingScores.length > 0 
            ? (count / writingScores.length) * 100 
            : 0;
          
          return (
            <div key={score}>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{score} - {scoringCriteria[score].split(':')[0]}</span>
                <span className="text-sm font-medium">{count}</span>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
                style={{
                  '--progress-background': 
                    score === 5 ? '#22c55e' : 
                    score === 4 ? '#3b82f6' : 
                    score === 3 ? '#eab308' : 
                    score === 2 ? '#f97316' : 
                    '#ef4444'
                } as React.CSSProperties} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WritingTab: React.FC<WritingTabProps> = ({
  assessmentData,
  getScoreColor,
  getScoreBgColor,
  getScoreLabel
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle>Writing Assessment</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="font-medium mb-1">Scoring Criteria:</p>
                <ul className="text-xs space-y-1">
                  {Object.entries(scoringCriteria).map(([score, description]) => (
                    <li key={score} className="flex gap-2">
                      <span className="font-semibold">{score}:</span>
                      <span>{description}</span>
                    </li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent>
        {assessmentData.overallWritingScore ? (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Overall Score</h3>
                  <p className={`text-3xl font-bold ${getScoreColor(assessmentData.overallWritingScore)}`}>
                    {assessmentData.overallWritingScore}/5
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Rating</h3>
                  <p className={`text-xl font-bold ${getScoreColor(assessmentData.overallWritingScore)}`}>
                    {getScoreLabel(assessmentData.overallWritingScore)}
                  </p>
                </div>
              </div>
              
              <div className={`p-4 rounded-md ${getScoreBgColor(assessmentData.overallWritingScore)} border`}>
                <h4 className="font-medium mb-2">What this score means:</h4>
                <p className="text-sm">
                  {Object.entries(scoringCriteria)
                    .find(([score]) => Math.floor(assessmentData.overallWritingScore) === parseInt(score))?.[1] ||
                    "The response quality is between defined scoring levels."}
                </p>
              </div>
            </div>
            
            {assessmentData.writingScores && assessmentData.writingScores.length > 0 && (
              <ScoreDistribution writingScores={assessmentData.writingScores} />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center p-6 bg-amber-50 rounded-lg mb-6">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
              <h3 className="text-lg font-medium text-amber-800 mb-1">No AI Evaluation Available</h3>
              <p className="text-amber-700 max-w-md">
                The AI has not evaluated this assessment's writing yet. Use the "Evaluate Writing" button at the top of the page to start the evaluation process.
              </p>
            </div>
          </div>
        )}
        
        {/* Add SkillsRadarChart for skills visualization */}
        {assessmentData.writingScores && assessmentData.writingScores.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium border-b pb-2 mb-4">Skills Analysis</h3>
            <SkillsRadarChart 
              writingScores={assessmentData.writingScores} 
              aptitudeScore={assessmentData.aptitudeScore}
              aptitudeTotal={assessmentData.aptitudeTotal}
            />
          </div>
        )}
        
        <div className="space-y-6">
          <h3 className="text-lg font-medium border-b pb-2">Writing Responses</h3>
          {assessmentData.completedPrompts.map((prompt: any, index: number) => {
            const promptScore = assessmentData.writingScores?.find(
              (score: any) => score.promptId === prompt.id
            );
            
            return (
              <WritingResponseItem 
                key={index}
                prompt={prompt}
                index={index}
                promptScore={promptScore}
                getScoreColor={getScoreColor}
                getScoreBgColor={getScoreBgColor}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WritingTab;
