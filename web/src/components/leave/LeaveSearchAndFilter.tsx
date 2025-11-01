
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import LeaveStatusFilter from "@/components/LeaveStatusFilter";
import DateRangeFilter from "@/components/DateRangeFilter";

interface LeaveSearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterStatus: (status?: "Pending" | "Approved" | "Rejected") => void;
  onFilterType: (type?: string) => void;
  onDateRangeFilter: (start: Date | null, end: Date | null) => void;
}

const LeaveSearchAndFilter = ({
  searchTerm,
  onSearchChange,
  onFilterStatus,
  onFilterType,
  onDateRangeFilter,
}: LeaveSearchAndFilterProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-grow">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search leave requests..."
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <LeaveStatusFilter
        onFilterStatus={onFilterStatus}
        onFilterType={onFilterType}
      />
      <DateRangeFilter onApply={onDateRangeFilter} />
    </div>
  );
};

export default LeaveSearchAndFilter;
