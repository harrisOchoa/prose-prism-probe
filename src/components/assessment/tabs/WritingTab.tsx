
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
  return (
    <Card className="shadow-subtle">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle>Writing Assessment</CardTitle>
          <ScoringCriteriaTooltip />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {assessmentData.overallWritingScore ? (
          <div className="grid md:grid-cols-2 gap-6">
            <ScoringSummary
              overallWritingScore={assessmentData.overallWritingScore}
              getScoreColor={getScoreColor}
              getScoreBgColor={getScoreBgColor}
              getScoreLabel={getScoreLabel}
            />
            
            {assessmentData.writingScores && assessmentData.writingScores.length > 0 && (
              <ScoreDistribution writingScores={assessmentData.writingScores} />
            )}
          </div>
        ) : (
          <NoEvaluationMessage />
        )}
        
        {/* Add SkillsRadarChart for skills visualization */}
        {assessmentData.writingScores && assessmentData.writingScores.length > 0 && (
          <div className="mb-6">
            <SkillsRadarChart 
              writingScores={assessmentData.writingScores} 
              aptitudeScore={assessmentData.aptitudeScore}
              aptitudeTotal={assessmentData.aptitudeTotal}
            />
          </div>
        )}
        
        <WritingResponsesList 
          completedPrompts={assessmentData.completedPrompts}
          writingScores={assessmentData.writingScores}
          getScoreColor={getScoreColor}
          getScoreBgColor={getScoreBgColor}
        />
      </CardContent>
    </Card>
  );
};

export default WritingTab;
