
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface LeaveStatusFilterProps {
  onFilterStatus: (status?: 'Pending' | 'Approved' | 'Rejected') => void;
  onFilterType: (type?: string) => void;
}

const LeaveStatusFilter = ({ onFilterStatus, onFilterType }: LeaveStatusFilterProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Filter By Status</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onFilterStatus('Pending')}>Status: Pending</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterStatus('Approved')}>Status: Approved</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterStatus('Rejected')}>Status: Rejected</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterStatus(undefined)}>Clear Status Filter</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Filter By Type</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onFilterType('Vacation Leave')}>Type: Vacation</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterType('Sick Leave')}>Type: Sick</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterType('Emergency Leave')}>Type: Emergency</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterType('Personal Leave')}>Type: Personal</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterType(undefined)}>Clear Type Filter</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LeaveStatusFilter;
