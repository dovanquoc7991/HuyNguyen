// src/components/ui/pagination.tsx
import React from "react";
import { Button } from "../ui/button"; // Đảm bảo đường dẫn này đúng

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  if (totalPages <= 1) {
    return null; // Không hiển thị phân trang nếu chỉ có 1 trang
  }

  const handlePrevious = () => {
    onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    onPageChange(currentPage + 1);
  };

  return (
    <div className={`flex items-center justify-end space-x-2 mt-6 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
};