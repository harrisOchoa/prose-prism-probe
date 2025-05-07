
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ChevronRight, Star, Medal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const mockTopCandidates = [
  { 
    id: '1', 
    name: 'Emma Johnson', 
    position: 'Senior Software Engineer', 
    score: 92,
    strengths: ['Problem Solving', 'Technical Knowledge']
  },
  { 
    id: '2', 
    name: 'Michael Chen', 
    position: 'UX Designer', 
    score: 88,
    strengths: ['Communication', 'Creative Thinking']
  },
  { 
    id: '3', 
    name: 'Sarah Miller', 
    position: 'Product Manager', 
    score: 85,
    strengths: ['Leadership', 'Critical Analysis']
  },
  { 
    id: '4', 
    name: 'David Garcia', 
    position: 'Data Analyst', 
    score: 83,
    strengths: ['Analytical Skills', 'Attention to Detail']
  }
];

const getProgressColor = (score: number) => {
  if (score >= 90) return "bg-green-600";
  if (score >= 80) return "bg-blue-600";
  if (score >= 70) return "bg-yellow-600";
  return "bg-orange-600";
};

const TopCandidatesCard = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Users className="mr-2 h-5 w-5 text-muted-foreground" />
          Top Performing Candidates
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-4 pb-0">
        <div className="space-y-4">
          {mockTopCandidates.map((candidate, index) => (
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
