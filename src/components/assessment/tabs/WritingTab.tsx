
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WritingScore } from "@/services/geminiService";
import SkillsRadarChart from "@/components/assessment/SkillsRadarChart";
import {
  ScoreDistribution,
  ScoringSummary,
  NoEvaluationMessage,
  WritingResponsesList,
  ScoringCriteriaTooltip
} from "./writing";
import { ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import { questionBank } from "@/utils/questionBank";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface WritingTabProps {
  assessmentData: any;
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
  getScoreLabel: (score: number) => string;
}

const getPromptTextById = (id: number) => {
  const question = questionBank.find((q) => q.id === id);
  return question ? question.prompt : `Prompt #${id}`;
};

const WritingScoreCard: React.FC<{ ws: WritingScore }> = ({ ws }) => {
  return (
    <div
      className="rounded-md border border-gray-200 bg-[#F1F0FB] px-4 py-3 flex flex-col justify-center cursor-default select-none shadow-sm hover:shadow-md transition-shadow duration-200"
      title={getPromptTextById(ws.promptId)}
    >
      <span className="text-sm text-gray-600 font-semibold mb-1">Question {ws.promptId}</span>
      <span className={`text-xl font-bold ${ws.score >= 4.5 ? 'text-green-600' : ws.score >= 3.5 ? 'text-yellow-600' : ws.score >= 2.5 ? 'text-amber-600' : ws.score >= 1.5 ? 'text-orange-600' : 'text-red-600'}`}>
        {ws.score.toFixed(1)}/5
      </span>
    </div>
  );
};

const WritingTab: React.FC<WritingTabProps> = ({
  assessmentData,
  getScoreColor,
  getScoreBgColor,
  getScoreLabel
}) => {
  const hasInsights = Boolean(
    assessmentData?.strengths?.length ||
    assessmentData?.weaknesses?.length
  );

  return (
    <Card className="shadow-subtle animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-t-md border-b">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl font-semibold flex items-center gap-2 text-hirescribe-primary">
            <Sparkles className="h-6 w-6 text-indigo-400" />
            Writing Assessment
          </CardTitle>
          <ScoringCriteriaTooltip />
        </div>
      </CardHeader>

      <CardContent className="space-y-10 pt-6">
        {assessmentData.overallWritingScore ? (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-4">
              <ScoringSummary
                overallWritingScore={assessmentData.overallWritingScore}
                getScoreColor={getScoreColor}
                getScoreBgColor={getScoreBgColor}
                getScoreLabel={getScoreLabel}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {assessmentData.writingScores && assessmentData.writingScores.map((ws: WritingScore) => (
                  <WritingScoreCard key={ws.promptId} ws={ws} />
                ))}
                <div className="rounded-md border border-gray-200 bg-[#F1F0FB] px-4 py-3 flex flex-col justify-center cursor-default select-none shadow-sm hover:shadow-md transition-shadow duration-200">
                  <span className="text-sm text-gray-600 font-semibold mb-1">Aptitude Test Score</span>
                  <span className="text-xl font-bold text-yellow-600">
                    {assessmentData.aptitudeScore?.toFixed(1) ?? 'N/A'}/
                    {assessmentData.aptitudeTotal ?? ''}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <NoEvaluationMessage />
        )}

        {hasInsights && (
          <div className="rounded-xl border bg-[#F1F0FB] p-6 grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-green-700 text-base">Key Strengths</span>
              </div>
              <ul className="list-disc list-inside space-y-2 ml-2">
                {assessmentData.strengths?.map((strength: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-700">{strength}</li>
                ))}
                {!assessmentData.strengths?.length && (
                  <li className="text-xs text-gray-400">No strengths identified.</li>
                )}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ThumbsDown className="h-5 w-5 text-amber-500" />
                <span className="font-semibold text-amber-700 text-base">Areas for Improvement</span>
              </div>
              <ul className="list-disc list-inside space-y-2 ml-2">
                {assessmentData.weaknesses?.map((weakness: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-700">{weakness}</li>
                ))}
                {!assessmentData.weaknesses?.length && (
                  <li className="text-xs text-gray-400">No weaknesses identified.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {assessmentData.writingScores && assessmentData.writingScores.length > 0 && (
          <div className="mb-8 animate-fade-in">
            <SkillsRadarChart 
              writingScores={assessmentData.writingScores}
              aptitudeScore={assessmentData.aptitudeScore}
              aptitudeTotal={assessmentData.aptitudeTotal}
            />
          </div>
        )}

        <div className="bg-white/70 rounded-lg border p-6 shadow-sm">
          <WritingResponsesList 
            completedPrompts={assessmentData.completedPrompts}
            writingScores={assessmentData.writingScores}
            getScoreColor={getScoreColor}
            getScoreBgColor={getScoreBgColor}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WritingTab;

