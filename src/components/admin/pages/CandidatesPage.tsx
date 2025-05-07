
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, UserPlus, Filter, ArrowUpDown, Calendar, Briefcase, FileText } from "lucide-react";
import EmptyState from "@/components/admin/dashboard/components/EmptyState";
import { useAdminCandidates } from "@/hooks/useAdminCandidates";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const CandidatesPage = () => {
  const { candidates, loading, error, searchTerm, setSearchTerm } = useAdminCandidates();
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    if (!sortColumn) return 0;
    
    switch (sortColumn) {
      case 'name':
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      case 'position':
        return sortDirection === 'asc' 
          ? a.position.localeCompare(b.position) 
          : b.position.localeCompare(a.position);
      case 'submissions':
        return sortDirection === 'asc' 
          ? a.submissions - b.submissions 
          : b.submissions - a.submissions;
      case 'date':
        return sortDirection === 'asc' 
          ? a.latestSubmission.getTime() - b.latestSubmission.getTime() 
          : b.latestSubmission.getTime() - a.latestSubmission.getTime();
      case 'score':
        const scoreA = a.averageScore || 0;
        const scoreB = b.averageScore || 0;
        return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      default:
        return 0;
    }
  });

  const getScoreColor = (score?: number) => {
    if (score === undefined) return "bg-gray-200 text-gray-700";
    if (score >= 4.5) return "bg-green-100 text-green-700";
    if (score >= 3.5) return "bg-blue-100 text-blue-700";
    if (score >= 2.5) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
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
          title="Error loading candidates" 
          message={error}
          icon={<Users className="h-12 w-12 text-muted-foreground opacity-70" />}
        />
      );
    }

    if (candidates.length === 0) {
      return (
        <EmptyState 
          title="No candidates found" 
          message="There are no candidates registered in the system yet. Add your first candidate to get started."
          actionLabel="Add Candidate"
          onAction={() => {}}
          icon={<Users className="h-12 w-12 text-muted-foreground opacity-70" />}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCandidates.map((candidate) => (
          <Card key={candidate.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg">{candidate.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {candidate.position}
                    </div>
                  </div>
                  <Badge variant="outline" className={getScoreColor(candidate.averageScore)}>
                    {candidate.averageScore !== undefined 
                      ? `${candidate.averageScore.toFixed(1)}/5.0`
                      : "N/A"}
                  </Badge>
                </div>
              </div>
              <div className="bg-muted/30 px-4 py-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Assessments</span>
                    <div className="flex items-center mt-1">
                      <FileText className="h-4 w-4 mr-1.5 text-primary" />
                      <span className="font-medium">{candidate.submissions}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Last Submission</span>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1.5 text-primary" />
                      <span className="font-medium text-sm">{format(candidate.latestSubmission, 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading candidates...' : `${candidates.length} candidates in the system`}
          </p>
        </div>
        
        <Button className="bg-hirescribe-primary hover:bg-hirescribe-accent transition-colors">
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Candidate
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search candidates..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex gap-2">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Candidate Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidatesPage;
