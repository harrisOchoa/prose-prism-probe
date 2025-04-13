
import React from "react";
import { Progress } from "@/components/ui/progress";
import { WritingScore, scoringCriteria } from "@/services/geminiService";

interface ScoreDistributionProps {
  writingScores: WritingScore[];
}

const ScoreDistribution: React.FC<ScoreDistributionProps> = ({ writingScores }) => {
  return (
    <div className="border rounded-lg p-4 shadow-subtle">
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

export default ScoreDistribution;
