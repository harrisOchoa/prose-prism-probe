
import React from "react";
import { cn } from "@/lib/utils";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useIsMobile } from "@/hooks/use-mobile";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (pageNumber: number) => void;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  handlePageChange,
}) => {
  const isMobile = useIsMobile();

  if (totalPages <= 1) return null;

  return (
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
          
          {!isMobile && Array.from({ length: totalPages }, (_, i) => (
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
          
          {isMobile && (
            <PaginationItem>
              <div className="text-sm px-2">
                Page {currentPage} of {totalPages}
              </div>
            </PaginationItem>
          )}
          
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
  );
};

export default TablePagination;
