
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
import { Search, FileText, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import AssessmentDetails from "./AssessmentDetails";

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

  if (showDetails && selectedAssessment) {
    return <AssessmentDetails assessment={selectedAssessment} onBack={() => setShowDetails(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or position..."
            className="pl-8 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssessments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Aptitude Score</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAptitudeScore}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Word Count</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageWordCount}</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center my-10">
          <p>Loading assessment data...</p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Assessment Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Aptitude Score</TableHead>
                    <TableHead>Word Count</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">{assessment.candidateName}</TableCell>
                        <TableCell>{assessment.candidatePosition}</TableCell>
                        <TableCell>
                          {assessment.aptitudeScore}/{assessment.aptitudeTotal} ({Math.round((assessment.aptitudeScore / assessment.aptitudeTotal) * 100)}%)
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
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No assessments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {filteredAssessments.length > itemsPerPage && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            isActive={currentPage === i + 1}
                            onClick={() => handlePageChange(i + 1)}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
