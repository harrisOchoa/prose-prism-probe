
import React from "react";
import { cn } from "@/lib/utils";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (pageNumber: number) => void;
  loading?: boolean;
  hasNextPage?: boolean;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  handlePageChange,
  loading = false,
  hasNextPage = false
}) => {
  const isMobile = useIsMobile();

  if (totalPages <= 1 && !hasNextPage) return null;

  // Calculate visible page range
  const getVisiblePageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = isMobile ? 3 : 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };
  
  const visiblePageNumbers = getVisiblePageNumbers();
  const showStartEllipsis = visiblePageNumbers[0] > 1;
  const showEndEllipsis = visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages;
  
  // The effective total pages is the actual total plus one if there might be a next page
  const effectiveTotalPages = hasNextPage ? totalPages + 1 : totalPages;

  return (
    <div className="mt-6 flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
              className={cn(
                "transition-all",
                (currentPage === 1 || loading) ? "pointer-events-none opacity-50" : "hover:text-hirescribe-primary"
              )}
            />
          </PaginationItem>
          
          {!isMobile && (
            <>
              {/* First page shortcut */}
              {showStartEllipsis && (
                <>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(1)}
                      className="hover:text-hirescribe-primary transition-all"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                </>
              )}
              
              {/* Visible page numbers */}
              {visiblePageNumbers.map(pageNum => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={currentPage === pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      "transition-all",
                      currentPage === pageNum ? "bg-hirescribe-primary text-white" : "hover:text-hirescribe-primary"
                    )}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              {/* Last page shortcut */}
              {showEndEllipsis && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(totalPages)}
                      className="hover:text-hirescribe-primary transition-all"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
            </>
          )}
          
          {/* Mobile view shows simple page indicator */}
          {isMobile && (
            <PaginationItem>
              <div className="text-sm px-2 flex items-center">
                Page {currentPage} of {effectiveTotalPages}
                {loading && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
              </div>
            </PaginationItem>
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(Math.min(effectiveTotalPages, currentPage + 1))} 
              className={cn(
                "transition-all", 
                (currentPage === effectiveTotalPages || loading || (!hasNextPage && currentPage === totalPages)) 
                  ? "pointer-events-none opacity-50" 
                  : "hover:text-hirescribe-primary"
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      
      {!isMobile && loading && (
        <div className="ml-2 flex items-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          Loading...
        </div>
      )}
    </div>
  );
};

export default TablePagination;
