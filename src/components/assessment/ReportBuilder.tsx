
import React, { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Calculator, 
  Edit, 
  Brain, 
  User, 
  Users, 
  MessageSquare,
  Loader2
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ReportBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentData: {
    candidateName: string;
    candidatePosition: string;
    aptitudeScore?: number;
    writingScores?: any[];
    personalityInsights?: any;
    interviewQuestions?: any[];
    profileMatch?: any;
    detailedWritingAnalysis?: any;
  };
  onExport: (sections: string[], templateName: string) => Promise<void>;
}

const ReportBuilder: React.FC<ReportBuilderProps> = ({
  isOpen,
  onClose,
  assessmentData,
  onExport
}) => {
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("sections");
  const [selectedTemplate, setSelectedTemplate] = useState("complete");
  
  // State for selected sections
  const [selectedSections, setSelectedSections] = useState<{[key: string]: boolean}>({
    overview: true,
    aptitude: true,
    writing: true,
    writingAnalysis: false,
    personality: false,
    profileMatch: false,
    interviewQuestions: false
  });
  
  // Check if sections are available in the assessment data
  const hasWritingScores = assessmentData.writingScores && assessmentData.writingScores.length > 0;
  const hasPersonality = assessmentData.personalityInsights && assessmentData.personalityInsights.length > 0;
  const hasProfileMatch = assessmentData.profileMatch && Object.keys(assessmentData.profileMatch).length > 0;
  const hasInterviewQuestions = assessmentData.interviewQuestions && assessmentData.interviewQuestions.length > 0;
  const hasWritingAnalysis = assessmentData.detailedWritingAnalysis && Object.keys(assessmentData.detailedWritingAnalysis).length > 0;
  
  // Templates
  const templates = [
    {
      id: "basic",
      name: "Basic Report",
      description: "Overview, Aptitude and Writing sections",
      sections: ["overview", "aptitude", "writing"]
    },
    {
      id: "complete",
      name: "Complete Assessment",
      description: "All available assessment sections",
      sections: ["overview", "aptitude", "writing", "writingAnalysis", "personality", "profileMatch", "interviewQuestions"]
    },
    {
      id: "executive",
      name: "Executive Summary",
      description: "Overview with key metrics and insights",
      sections: ["overview"]
    },
    {
      id: "technical",
      name: "Technical Profile",
      description: "Aptitude and Writing with detailed analysis",
      sections: ["aptitude", "writing", "writingAnalysis"]
    },
    {
      id: "interview",
      name: "Interview Preparation",
      description: "Personality insights, Profile match and Interview questions",
      sections: ["overview", "personality", "profileMatch", "interviewQuestions"]
    }
  ];
  
  // Apply template
  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newSections = {...selectedSections};
      
      // Reset all to false first
      Object.keys(newSections).forEach(key => {
        newSections[key] = false;
      });
      
      // Set selected sections based on template
      template.sections.forEach(section => {
        newSections[section] = true;
      });
      
      setSelectedSections(newSections);
      setSelectedTemplate(templateId);
    }
  };
  
  // Toggle section selection
  const toggleSection = (section: string) => {
    setSelectedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    
    // When manually selecting sections, clear template selection
    setSelectedTemplate("custom");
  };
  
  // Handle export
  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Get array of selected sections
      const sections = Object.entries(selectedSections)
        .filter(([_, isSelected]) => isSelected)
        .map(([section]) => section);
      
      if (sections.length === 0) {
        toast({
          title: "No sections selected",
          description: "Please select at least one section to export",
          variant: "destructive"
        });
        setExporting(false);
        return;
      }
      
      await onExport(sections, selectedTemplate);
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was a problem creating your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Assessment Report Builder</DialogTitle>
          <DialogDescription>
            Create a professional report by selecting the sections you want to include.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Select Sections
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Report Templates
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sections" className="mt-4 space-y-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <h3 className="font-medium">Core Sections</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-start space-x-2 border p-3 rounded-md">
                    <Checkbox 
                      id="overview" 
                      checked={selectedSections.overview} 
                      onCheckedChange={() => toggleSection("overview")} 
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor="overview" className="font-medium">Overview</Label>
                      <p className="text-xs text-muted-foreground">Summary and key metrics</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2 border p-3 rounded-md">
                    <Checkbox 
                      id="aptitude" 
                      checked={selectedSections.aptitude} 
                      onCheckedChange={() => toggleSection("aptitude")}
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor="aptitude" className="font-medium">Aptitude Assessment</Label>
                      <p className="text-xs text-muted-foreground">Technical aptitude results</p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "flex items-start space-x-2 border p-3 rounded-md",
                    !hasWritingScores && "opacity-60"
                  )}>
                    <Checkbox 
                      id="writing" 
                      checked={selectedSections.writing} 
                      onCheckedChange={() => toggleSection("writing")}
                      disabled={!hasWritingScores}
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor="writing" className="font-medium">Writing Assessment</Label>
                      <p className="text-xs text-muted-foreground">Written responses and scores</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Advanced Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className={cn(
                    "flex items-start space-x-2 border p-3 rounded-md",
                    !hasWritingAnalysis && "opacity-60"
                  )}>
                    <Checkbox 
                      id="writingAnalysis" 
                      checked={selectedSections.writingAnalysis} 
                      onCheckedChange={() => toggleSection("writingAnalysis")}
                      disabled={!hasWritingAnalysis}
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor="writingAnalysis" className="font-medium">Writing Analysis</Label>
                      <p className="text-xs text-muted-foreground">Detailed writing skill breakdown</p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "flex items-start space-x-2 border p-3 rounded-md",
                    !hasPersonality && "opacity-60"
                  )}>
                    <Checkbox 
                      id="personality" 
                      checked={selectedSections.personality} 
                      onCheckedChange={() => toggleSection("personality")}
                      disabled={!hasPersonality}
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor="personality" className="font-medium">Personality Insights</Label>
                      <p className="text-xs text-muted-foreground">Behavioral and personality profile</p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "flex items-start space-x-2 border p-3 rounded-md",
                    !hasProfileMatch && "opacity-60"
                  )}>
                    <Checkbox 
                      id="profileMatch" 
                      checked={selectedSections.profileMatch} 
                      onCheckedChange={() => toggleSection("profileMatch")}
                      disabled={!hasProfileMatch}
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor="profileMatch" className="font-medium">Profile Match</Label>
                      <p className="text-xs text-muted-foreground">Job fit and role compatibility</p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "flex items-start space-x-2 border p-3 rounded-md",
                    !hasInterviewQuestions && "opacity-60"
                  )}>
                    <Checkbox 
                      id="interviewQuestions" 
                      checked={selectedSections.interviewQuestions} 
                      onCheckedChange={() => toggleSection("interviewQuestions")}
                      disabled={!hasInterviewQuestions}
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor="interviewQuestions" className="font-medium">Interview Questions</Label>
                      <p className="text-xs text-muted-foreground">Generated interview questions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(template => (
                <div 
                  key={template.id}
                  className={cn(
                    "border rounded-lg p-4 cursor-pointer hover:border-primary transition-all",
                    selectedTemplate === template.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => applyTemplate(template.id)}
                >
                  <h3 className="font-medium text-lg">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.sections.map(section => (
                      <span 
                        key={section} 
                        className="text-xs bg-secondary/20 px-2 py-1 rounded-full"
                      >
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <div className="text-sm text-muted-foreground mr-auto">
            {Object.values(selectedSections).filter(Boolean).length} sections selected
          </div>
          <Button variant="outline" onClick={onClose} disabled={exporting}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            className="gap-2"
            disabled={
              exporting || 
              Object.values(selectedSections).filter(Boolean).length === 0
            }
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Export PDF Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportBuilder;
