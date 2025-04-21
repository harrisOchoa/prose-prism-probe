
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, BrainCircuit, Clock, Target } from "lucide-react";
import AptitudeAnalysisTab from "../advanced-analysis/AptitudeAnalysisTab";
import { Button } from "@/components/ui/button";

interface PerformanceRatingProps {
  percentage: number;
}

const PerformanceRating: React.FC<PerformanceRatingProps> = ({ percentage }) => {
  const getRatingLabel = (percent: number) => {
    if (percent >= 80) return 'Excellent';
    if (percent >= 70) return 'Good';
    if (percent >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  };
  
  const getRatingClass = (percent: number) => {
    if (percent >= 80) return 'bg-green-50 text-green-700 border-green-200';
    if (percent >= 70) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (percent >= 60) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };
  
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="flex items-center mb-2">
        <Award className="h-5 w-5 mr-2 text-purple-500" />
        <h4 className="font-medium">Performance Rating</h4>
      </div>
      <div className={`py-2 px-3 rounded-md ${getRatingClass(percentage)} border`}>
        <div className="font-semibold text-center">{getRatingLabel(percentage)}</div>
      </div>
    </div>
  );
};

interface ScoreBreakdownProps {
  correct: number;
  total: number;
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ correct, total }) => {
  const incorrect = total - correct;
  
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-center mb-3">
        <Target className="h-5 w-5 mr-2 text-purple-500" />
        <h4 className="font-medium">Score Breakdown</h4>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Correct Answers</span>
            <span className="text-sm font-medium text-green-600">{correct}</span>
          </div>
          <Progress 
            value={(correct / total) * 100} 
            className="h-2.5 bg-gray-100" 
            color="#22c55e"
          />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Incorrect Answers</span>
            <span className="text-sm font-medium text-red-600">{incorrect}</span>
          </div>
          <Progress 
            value={(incorrect / total) * 100} 
            className="h-2.5 bg-gray-100"
            color="#ef4444"
          />
        </div>
      </div>
    </div>
  );
};

interface CategoryBreakdownProps {
  categories?: {
    name: string;
    correct: number;
    total: number;
  }[];
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ categories = [] }) => {
  // If no categories data, generate sample data
  const displayCategories = categories.length > 0 ? categories : [
    { name: "Logical Reasoning", correct: 7, total: 10 },
    { name: "Numerical Analysis", correct: 5, total: 8 },
    { name: "Verbal Comprehension", correct: 4, total: 7 },
    { name: "Problem Solving", correct: 4, total: 5 }
  ];
  
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-center mb-3">
        <BrainCircuit className="h-5 w-5 mr-2 text-purple-500" />
        <h4 className="font-medium">Category Performance</h4>
      </div>
      <div className="space-y-3">
        {displayCategories.map((category, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-sm">{category.name}</span>
              <span className="text-sm font-medium">
                {category.correct}/{category.total} 
                <span className="text-gray-500 ml-1">
                  ({Math.round((category.correct / category.total) * 100)}%)
                </span>
              </span>
            </div>
            <Progress 
              value={(category.correct / category.total) * 100} 
              className="h-2.5 bg-gray-100" 
              color={
                (category.correct / category.total) >= 0.8 ? "#22c55e" : 
                (category.correct / category.total) >= 0.6 ? "#eab308" : 
                "#ef4444"
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

interface TimePerformanceProps {
  timePerQuestion?: number;
}

const TimePerformance: React.FC<TimePerformanceProps> = ({ timePerQuestion = 25 }) => {
  const getTimeRating = () => {
    if (timePerQuestion < 20) return { label: 'Excellent', class: 'bg-green-50 text-green-700 border-green-200' };
    if (timePerQuestion < 30) return { label: 'Good', class: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (timePerQuestion < 40) return { label: 'Average', class: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
    return { label: 'Slow', class: 'bg-red-50 text-red-700 border-red-200' };
  };
  
  const rating = getTimeRating();
  
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-center mb-3">
        <Clock className="h-5 w-5 mr-2 text-purple-500" />
        <h4 className="font-medium">Time Performance</h4>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md border p-2 bg-gray-50">
          <div className="text-sm text-gray-500">Avg. Time per Question</div>
          <div className="text-lg font-semibold">{timePerQuestion} seconds</div>
        </div>
        <div className={`rounded-md border p-2 ${rating.class}`}>
          <div className="text-sm">Speed Rating</div>
          <div className="text-lg font-semibold">{rating.label}</div>
        </div>
      </div>
    </div>
  );
};

interface AptitudeTabProps {
  assessmentData: any;
  getAptitudeScorePercentage: () => number;
  generateAdvancedAnalysis?: (analysisType: string) => Promise<any>;
  generatingAnalysis?: {[key: string]: boolean};
}

const AptitudeTab: React.FC<AptitudeTabProps> = ({
  assessmentData,
  getAptitudeScorePercentage,
  generateAdvancedAnalysis,
  generatingAnalysis
}) => {
  const [activeTab, setActiveTab] = useState("results");
  
  const handleAnalysisTabChange = (value: string) => {
    setActiveTab(value);
    
    // If switching to analysis tab and no analysis exists, generate it
    if (value === "analysis" && 
        generateAdvancedAnalysis && 
        !assessmentData.aptitudeAnalysis &&
        !generatingAnalysis?.aptitude) {
      generateAdvancedAnalysis("aptitude");
    }
  };
  
  return (
    <Tabs value={activeTab} onValueChange={handleAnalysisTabChange} className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 bg-muted/50">
        <TabsTrigger value="results" className="data-[state=active]:bg-background rounded-none data-[state=active]:shadow">
          Test Results
        </TabsTrigger>
        <TabsTrigger value="analysis" className="data-[state=active]:bg-background rounded-none data-[state=active]:shadow">
          Analysis & Insights
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="results" className="mt-4 space-y-6">
        <Card className="overflow-hidden border shadow-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
            <CardTitle>Aptitude Test Results</CardTitle>
            <CardDescription>
              Performance on multiple-choice questions assessing cognitive abilities
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Score</div>
                    <div className="text-3xl font-bold text-purple-700">{assessmentData.aptitudeScore}/{assessmentData.aptitudeTotal}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Percentage</div>
                    <div className="text-3xl font-bold text-indigo-600">{getAptitudeScorePercentage()}%</div>
                  </div>
                </div>
                
                <PerformanceRating percentage={getAptitudeScorePercentage()} />
                
                <TimePerformance 
                  timePerQuestion={assessmentData.timePerQuestion || 25} 
                />
              </div>
              
              <div className="space-y-6">
                <ScoreBreakdown 
                  correct={assessmentData.aptitudeScore} 
                  total={assessmentData.aptitudeTotal} 
                />
                
                <CategoryBreakdown 
                  categories={assessmentData.categoryBreakdown} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="analysis" className="mt-4">
        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
            <CardTitle>Aptitude Analysis</CardTitle>
            <CardDescription>
              Detailed insights about strengths, weaknesses, and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {generateAdvancedAnalysis ? (
              <AptitudeAnalysisTab
                aptitudeAnalysis={assessmentData.aptitudeAnalysis}
                loading={generatingAnalysis?.aptitude || false}
                handleGenerateAnalysis={() => generateAdvancedAnalysis("aptitude")}
                getAnalysisButtonLabel={() => 
                  assessmentData.aptitudeAnalysis 
                    ? "Regenerate Analysis" 
                    : "Generate Analysis"
                }
              />
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed">
                <p className="text-gray-600 mb-4">
                  Analysis feature not available in this view.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = `/view/${assessmentData.id}?tab=advanced`}
                >
                  View in Advanced Analysis Tab
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AptitudeTab;
