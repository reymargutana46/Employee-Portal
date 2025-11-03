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
  // Define the leave types for filtering
  const leaveTypes = [
    'Vacation Leave',
    'Mandatory/Forced Leave',
    'Sick Leave',
    'Maternity Leave',
    'Paternity Leave',
    'Special Privilege Leave',
    'Solo Parent Leave',
    'Study Leave',
    '10-Day VAWC Leave',
    'Rehabilitation Privilege Leave',
    'Special Leave Benefits for Women',
    'Special Emergency (Calamity) Leave',
    'Adoption Leave'
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
        <DropdownMenuLabel>Filter By Status</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onFilterStatus('Pending')}>Status: Pending</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterStatus('Approved')}>Status: Approved</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterStatus('Rejected')}>Status: Disapproved</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterStatus(undefined)}>Clear Status Filter</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Filter By Type</DropdownMenuLabel>
        {leaveTypes.map((type) => (
          <DropdownMenuItem key={type} onClick={() => onFilterType(type)}>
            Type: {type}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={() => onFilterType(undefined)}>Clear Type Filter</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LeaveStatusFilter;