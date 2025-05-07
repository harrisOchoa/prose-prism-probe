
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ChevronRight, Star, Medal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AssessmentData } from "@/types/assessment";

interface TopCandidatesCardProps {
  assessments: AssessmentData[];
}

const getProgressColor = (score: number) => {
  if (score >= 90) return "bg-green-600";
  if (score >= 80) return "bg-blue-600";
  if (score >= 70) return "bg-yellow-600";
  return "bg-orange-600";
};

const TopCandidatesCard: React.FC<TopCandidatesCardProps> = ({ assessments = [] }) => {
  const navigate = useNavigate();
  
  const topCandidates = useMemo(() => {
    // Filter assessments with valid scores
    const validAssessments = assessments.filter(a => 
      a.candidateName && 
      a.candidatePosition && 
      (a.aptitudeScore !== undefined || a.overallWritingScore !== undefined)
    );
    
    // Calculate overall score (average of aptitude and writing)
    const scoredAssessments = validAssessments.map(assessment => {
      const aptitudeScore = assessment.aptitudeScore !== undefined 
        ? (assessment.aptitudeScore / (assessment.aptitudeTotal || 1)) * 100 
        : 0;
      const writingScore = assessment.overallWritingScore || 0;
      
      // Calculate overall score (average of both scores)
      let overallScore = 0;
      let scoreCount = 0;
      
      if (assessment.aptitudeScore !== undefined) {
        overallScore += aptitudeScore;
        scoreCount++;
      }
      
      if (assessment.overallWritingScore !== undefined) {
        overallScore += writingScore;
        scoreCount++;
      }
      
      // Get final score
      const finalScore = scoreCount > 0 ? Math.round(overallScore / scoreCount) : 0;
      
      // Extract strengths from assessment data
      let strengths: string[] = [];
      
      // Try to get strengths from different possible sources
      if (Array.isArray(assessment.strengths)) {
        strengths = [...assessment.strengths].slice(0, 2);
      } else if (assessment.aptitudeCategories && Array.isArray(assessment.aptitudeCategories)) {
        // Find top categories based on percentage correct
        const sortedCategories = [...assessment.aptitudeCategories]
          .filter(cat => cat.total > 0)
          .sort((a, b) => (b.correct / b.total) - (a.correct / a.total))
          .slice(0, 2);
          
        strengths = sortedCategories.map(cat => cat.name);
      }

      return {
        id: assessment.id,
        name: assessment.candidateName,
        position: assessment.candidatePosition,
        score: finalScore,
        strengths: strengths.length ? strengths : ['Assessment Completed']
      };
    });
    
    // Sort by score and take top 4
    return scoredAssessments
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [assessments]);
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Users className="mr-2 h-5 w-5 text-muted-foreground" />
          Top Performing Candidates
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-4 pb-0">
        {topCandidates.length > 0 ? (
          <div className="space-y-4">
            {topCandidates.map((candidate, index) => (
              <div key={candidate.id} className="flex flex-col gap-2 p-4 border rounded-md hover:bg-muted/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {index === 0 ? (
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-full">
                        <Medal className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="p-2 bg-muted-foreground/10 text-muted-foreground rounded-full">
                        <Star className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium">{candidate.name}</h4>
                      <p className="text-sm text-muted-foreground">{candidate.position}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-800">
                    {candidate.score}%
                  </Badge>
                </div>
                
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Overall Performance</span>
                    <span className="font-medium">{candidate.score}%</span>
                  </div>
                  <Progress value={candidate.score} className={`h-2 ${getProgressColor(candidate.score)}`} />
                </div>
                
                <div className="flex flex-wrap gap-1 mt-1">
                  {candidate.strengths.map(strength => (
                    <Badge key={strength} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No candidate data available
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 pb-4 px-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between hover:bg-muted/50"
          onClick={() => navigate("/admin/candidates")}
        >
          View all candidates
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TopCandidatesCard;
