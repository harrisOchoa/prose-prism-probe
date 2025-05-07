
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, Filter, Plus, ArrowUpDown, Calendar, Clock, AlertCircle } from "lucide-react";
import EmptyState from "@/components/admin/dashboard/components/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAdminAssessments } from "@/hooks/useAdminAssessments";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AssessmentDetailsDialog from "./assessments/AssessmentDetailsDialog";

const AssessmentsPage = () => {
  const { 
    assessments, 
    loading, 
    error, 
    searchTerm, 
    setSearchTerm, 
    activeTab, 
    setActiveTab,
    counts 
  } = useAdminAssessments();
  
  // Add state for the dialog
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openAssessmentDetails = (assessment: any) => {
    setSelectedAssessment(assessment);
    setIsDialogOpen(true);
  };

  const closeAssessmentDetails = () => {
    setIsDialogOpen(false);
  };

  const getBadgeStyle = (status: string) => {
    switch(status) {
      case 'active':
        return "bg-green-50 text-green-700 border-green-200";
      case 'completed':
        return "bg-blue-50 text-blue-700 border-blue-200";
      case 'archived':
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active':
        return <Clock className="h-4 w-4 text-green-500 mr-1.5" />;
      case 'completed':
        return <FileText className="h-4 w-4 text-blue-500 mr-1.5" />;
      case 'archived':
        return <AlertCircle className="h-4 w-4 text-gray-500 mr-1.5" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number, total: number) => {
    if (!total) return "bg-gray-50 text-gray-700";
    const percentage = (score / total) * 100;
    
    if (percentage >= 80) return "bg-green-50 text-green-700";
    if (percentage >= 60) return "bg-blue-50 text-blue-700";
    if (percentage >= 40) return "bg-yellow-50 text-yellow-700";
    return "bg-red-50 text-red-700";
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      );
    }

    if (error) {
      return (
        <EmptyState 
          title="Error loading assessments" 
          message={error}
          icon={<FileText className="h-12 w-12 text-muted-foreground opacity-70" />}
        />
      );
    }

    if (assessments.length === 0) {
      return (
        <EmptyState 
          title="No assessments found" 
          message={activeTab === 'all' 
            ? "There are no assessments in the system yet." 
            : `No ${activeTab} assessments found.`}
          icon={<FileText className="h-12 w-12 text-muted-foreground opacity-70" />}
        />
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Assessment</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((assessment) => (
            <TableRow key={assessment.id}>
              <TableCell className="font-medium">{assessment.candidateName || "Unknown"}</TableCell>
              <TableCell>{assessment.candidatePosition || "Not specified"}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  {assessment.submittedAt?.toDate ? 
                    format(assessment.submittedAt.toDate(), 'MMM d, yyyy') : 
                    "Unknown date"}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className={getBadgeStyle(assessment.status)}>
                  <div className="flex items-center">
                    {getStatusIcon(assessment.status)}
                    {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                  </div>
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" 
                  className={getScoreColor(
                    assessment.aptitudeScore || 0, 
                    assessment.aptitudeTotal || 30
                  )}>
                  {assessment.aptitudeScore || 0}/{assessment.aptitudeTotal || 30}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => openAssessmentDetails(assessment)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Assessments</h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading assessments...' : `${counts.total} assessment submissions`}
          </p>
        </div>
        
        <Button className="bg-hirescribe-primary hover:bg-hirescribe-accent transition-colors">
          <Plus className="mr-2 h-4 w-4" />
          Create Assessment
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All Assessments</TabsTrigger>
            <TabsTrigger value="active">
              Active 
              <Badge variant="outline" className={`ml-2 ${getBadgeStyle('active')}`}>{counts.active}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              <Badge variant="outline" className={`ml-2 ${getBadgeStyle('completed')}`}>{counts.completed}</Badge>
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archived
              <Badge variant="outline" className={`ml-2 ${getBadgeStyle('archived')}`}>{counts.archived}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search assessments..." 
                className="pl-10 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="flex gap-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>
        
        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Assessment Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderContent()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add the Assessment Details Dialog */}
      <AssessmentDetailsDialog
        assessment={selectedAssessment}
        isOpen={isDialogOpen}
        onClose={closeAssessmentDetails}
      />
    </div>
  );
};

export default AssessmentsPage;
