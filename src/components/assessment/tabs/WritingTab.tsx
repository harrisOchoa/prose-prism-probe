
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

interface WritingTabProps {
  assessmentData: any;
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
  getScoreLabel: (score: number) => string;
}

const WritingTab: React.FC<WritingTabProps> = ({
  assessmentData,
  getScoreColor,
  getScoreBgColor,
  getScoreLabel
}) => {
  // Helpers to check for insights
  const hasInsights = Boolean(
    assessmentData?.strengths?.length ||
    assessmentData?.weaknesses?.length
  );

  // Helper for improved writing prompt stat cards
  const renderWritingScoreStats = () => {
    if (!assessmentData.writingScores || assessmentData.writingScores.length === 0) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {assessmentData.writingScores.map((ws: any, idx: number) => (
          <div
            key={ws.promptId || idx}
            className="rounded-xl bg-[#F1F0FB] border border-[#E5DEFF] shadow-sm flex flex-col items-center p-4 hover-scale transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 text-lg font-bold rounded-full bg-hirescribe-primary/90 text-white shadow">
                {ws.promptId}
              </span>
              <span className="uppercase text-xs text-[#7E69AB] font-semibold tracking-wide">Prompt</span>
            </div>
            <div className="mt-1 mb-2 text-3xl font-extrabold text-[#8B5CF6]">
              {ws.score?.toFixed(1)}
              <span className="text-base font-medium text-neutral-400 ml-1">/5</span>
            </div>
            <div className="text-xs text-[#403E43] opacity-60 text-center">
              {ws.feedback && typeof ws.feedback === "string"
                ? ws.feedback.slice(0, 54) + (ws.feedback.length > 54 ? "..." : "")
                : ""}
            </div>
          </div>
        ))}
      </div>
    );
  };

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
            {/* Scores and improved distribution */}
            <div className="grid md:grid-cols-2 gap-8 mb-4">
              <ScoringSummary
                overallWritingScore={assessmentData.overallWritingScore}
                getScoreColor={getScoreColor}
                getScoreBgColor={getScoreBgColor}
                getScoreLabel={getScoreLabel}
              />
              {/* Replacing ScoreDistribution visuals with enhanced stats cards for writing prompts */}
              {renderWritingScoreStats()}
            </div>
          </>
        ) : (
          <NoEvaluationMessage />
        )}

        {/* Strengths and Weaknesses section — no Gemini AI badge */}
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

        {/* Skills Radar Chart */}
        {assessmentData.writingScores && assessmentData.writingScores.length > 0 && (
          <div className="mb-8 animate-fade-in">
            <SkillsRadarChart 
              writingScores={assessmentData.writingScores}
              aptitudeScore={assessmentData.aptitudeScore}
              aptitudeTotal={assessmentData.aptitudeTotal}
            />
          </div>
        )}

        {/* Writing Responses */}
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
