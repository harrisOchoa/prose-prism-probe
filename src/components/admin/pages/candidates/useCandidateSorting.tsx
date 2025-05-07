
import { useState } from 'react';
import { CandidateData } from "@/hooks/useAdminCandidates";

export type SortColumn = 'name' | 'position' | 'submissions' | 'date' | 'score' | null;
export type SortDirection = 'asc' | 'desc';

export const useCandidateSorting = (initialCandidates: CandidateData[]) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedCandidates = [...initialCandidates].sort((a, b) => {
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

  return {
    sortColumn,
    sortDirection,
    handleSort,
    sortedCandidates
  };
};
