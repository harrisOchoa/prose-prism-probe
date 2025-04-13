
import React, { useState, useEffect } from "react";
import { getAllAssessments } from "@/firebase/assessmentService";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Users, Brain, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import AssessmentDetails from "./AssessmentDetails";
import { cn } from "@/lib/utils";

const AdminDashboard = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const results = await getAllAssessments();
        setAssessments(results);
      } catch (error) {
        console.error("Error fetching assessments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  // Filter assessments based on search term
  const filteredAssessments = assessments.filter((assessment) => 
    assessment.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.candidatePosition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssessments.slice(indexOfFirstItem, indexOfLastItem);
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const viewAssessmentDetails = (assessment: any) => {
    setSelectedAssessment(assessment);
    setShowDetails(true);
  };

  // Calculate statistics
  const totalAssessments = assessments.length;
  const averageAptitudeScore = assessments.length > 0 
    ? (assessments.reduce((sum, assessment) => sum + (assessment.aptitudeScore / assessment.aptitudeTotal * 100), 0) / assessments.length).toFixed(1)
    : 0;
  const averageWordCount = assessments.length > 0
    ? Math.round(assessments.reduce((sum, assessment) => sum + assessment.wordCount, 0) / assessments.length)
    : 0;
  const averageWritingScore = assessments.length > 0 
    ? (assessments.reduce((sum, assessment) => sum + (assessment.overallWritingScore || 0), 0) / 
       assessments.filter(a => a.overallWritingScore).length).toFixed(1)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "text-green-600 font-semibold";
    if (score >= 3.5) return "text-blue-600 font-semibold";
    if (score >= 2.5) return "text-yellow-600 font-semibold";
    if (score >= 1.5) return "text-orange-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  if (showDetails && selectedAssessment) {
    return <AssessmentDetails assessment={selectedAssessment} onBack={() => setShowDetails(false)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or position..."
            className="pl-8 w-full md:w-[300px] input-enhanced"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <FileText className="h-4 w-4 text-hirescribe-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssessments}</div>
            <p className="text-xs text-muted-foreground mt-1">Assessment submissions</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Aptitude Score</CardTitle>
            <Users className="h-4 w-4 text-hirescribe-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAptitudeScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average performance</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Word Count</CardTitle>
            <FileText className="h-4 w-4 text-hirescribe-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageWordCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Words per submission</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Writing Score</CardTitle>
            <Brain className="h-4 w-4 text-hirescribe-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageWritingScore}/5</div>
            <p className="text-xs text-muted-foreground mt-1">Quality assessment</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center my-10">
          <Card className="w-full p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-hirescribe-primary border-t-transparent animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading assessment data...</p>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="shadow-subtle hover:shadow-elevation-1 transition-all">
          <CardHeader>
            <CardTitle>Assessment Results</CardTitle>
            <CardDescription>Comprehensive view of all candidate assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Candidate Name</TableHead>
                    <TableHead className="font-semibold">Position</TableHead>
                    <TableHead className="font-semibold">Aptitude Score</TableHead>
                    <TableHead className="font-semibold">Writing Score</TableHead>
                    <TableHead className="font-semibold">Word Count</TableHead>
                    <TableHead className="font-semibold">Submission Date</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((assessment) => (
                      <TableRow key={assessment.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{assessment.candidateName}</TableCell>
                        <TableCell>{assessment.candidatePosition}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="mr-2 h-2 w-full max-w-[60px] bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-hirescribe-primary rounded-full" 
                                style={{ width: `${Math.round((assessment.aptitudeScore / assessment.aptitudeTotal) * 100)}%` }}
                              ></div>
                            </div>
                            <span>{assessment.aptitudeScore}/{assessment.aptitudeTotal}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {assessment.overallWritingScore ? (
                            <span className={getScoreColor(assessment.overallWritingScore)}>
                              {assessment.overallWritingScore}/5
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>{assessment.wordCount}</TableCell>
                        <TableCell>
                          {assessment.submittedAt && assessment.submittedAt.toDate 
                            ? new Date(assessment.submittedAt.toDate()).toLocaleString() 
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewAssessmentDetails(assessment)}
                            className="shadow-subtle hover:shadow-elevation-1 transition-all"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        <div className="flex flex-col items-center justify-center py-8">
                          <Filter className="h-12 w-12 text-muted-foreground mb-2 opacity-25" />
                          <p>No matching assessments found</p>
                          {searchTerm && <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredAssessments.length > itemsPerPage && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
                        className={cn(
                          "transition-all",
                          currentPage === 1 ? "pointer-events-none opacity-50" : "hover:text-hirescribe-primary"
                        )}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          isActive={currentPage === i + 1}
                          onClick={() => handlePageChange(i + 1)}
                          className={cn(
                            "transition-all",
                            currentPage === i + 1 ? "bg-hirescribe-primary text-white" : "hover:text-hirescribe-primary"
                          )}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
                        className={cn(
                          "transition-all", 
                          currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:text-hirescribe-primary"
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
