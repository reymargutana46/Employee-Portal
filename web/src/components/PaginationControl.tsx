import React from 'react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const PaginationControl = ({ currentPage, totalPages, onPageChange }) => {
  // Function to generate the pagination items array
  const renderPaginationItems = () => {
    const items = [];

    // Constants for controlling pagination display
    const siblingsToShow = 1; // Number of siblings on each side of current page
    const boundaryPages = 1;  // Number of pages to always show at start/end

    // For fewer pages, just render all page numbers
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => onPageChange(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      return items;
    }

    // For many pages, create a more complex pagination with ellipsis

    // Calculate ranges for displaying page numbers
    const leftBoundaryEnd = boundaryPages;
    const rightBoundaryStart = totalPages - boundaryPages + 1;

    const leftSiblingStart = Math.max(currentPage - siblingsToShow, 1);
    const rightSiblingEnd = Math.min(currentPage + siblingsToShow, totalPages);

    const showLeftEllipsis = leftSiblingStart > leftBoundaryEnd + 1;
    const showRightEllipsis = rightSiblingEnd < rightBoundaryStart - 1;

    // Helper function to add page buttons
    const addPageButton = (pageNum) => {
      items.push(
        <PaginationItem key={pageNum}>
          <PaginationLink className='cursor-pointer'
            onClick={() => onPageChange(pageNum)}
            isActive={currentPage === pageNum}
          >
            {pageNum}
          </PaginationLink>
        </PaginationItem>
      );
    };

    // Add left boundary pages (always show first page)
    for (let i = 1; i <= leftBoundaryEnd; i++) {
      addPageButton(i);
    }

    // Add left ellipsis if needed
    if (showLeftEllipsis) {
      items.push(
        <PaginationItem key="ellipsis-left">
          <span className="px-2">...</span>
        </PaginationItem>
      );
    } else if (leftBoundaryEnd + 1 < leftSiblingStart) {
      // Add the page after boundary directly if no ellipsis
      addPageButton(leftBoundaryEnd + 1);
    }

    // Add siblings and current page (but avoid duplicating boundary pages)
    for (let i = leftSiblingStart; i <= rightSiblingEnd; i++) {
      if (i > leftBoundaryEnd && i < rightBoundaryStart) {
        addPageButton(i);
      }
    }

    // Add right ellipsis if needed
    if (showRightEllipsis) {
      items.push(
        <PaginationItem key="ellipsis-right">
          <span className="px-2 text-lg">...</span>
        </PaginationItem>
      );
    } else if (rightSiblingEnd + 1 < rightBoundaryStart) {
      // Add the page before right boundary directly if no ellipsis
      addPageButton(rightBoundaryStart - 1);
    }

    // Add right boundary pages (always show last page)
    for (let i = rightBoundaryStart; i <= totalPages; i++) {
      addPageButton(i);
    }

    return items;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        {renderPaginationItems()}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationControl;
