
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
      
      <CardContent className="space-y-10">
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
        
        {/* Skills Radar Chart as a standalone section with clean spacing */}
        {assessmentData.writingScores && assessmentData.writingScores.length > 0 && (
          <div>
            <SkillsRadarChart 
              writingScores={assessmentData.writingScores} 
              aptitudeScore={assessmentData.aptitudeScore}
              aptitudeTotal={assessmentData.aptitudeTotal}
            />
          </div>
        )}
        
        {/* Writing Responses with clean separation */}
        <div className="pt-2">
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
