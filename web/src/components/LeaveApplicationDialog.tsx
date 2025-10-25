import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useLeaveStore } from '@/store/useLeaveStore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Employee } from '@/types/employee';
import { ApplyLeave, Leave } from '@/types/leave';
import { DateRangePicker } from './DateRangePicker';
import { DateRange } from 'react-day-picker';
import axios from '../utils/axiosInstance';
import { Res } from '@/types/response';
interface LeaveApplicationDialogProps {
  isAdmin?: boolean;
  leaveToEdit?: Leave;
  onClose?: () => void;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const LeaveApplicationDialog = ({
  isAdmin,
  leaveToEdit,
  onClose,
  onSuccess,
  trigger
}: LeaveApplicationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<string>(leaveToEdit?.leave_type.name || '');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    leaveToEdit ? {
      from: new Date(leaveToEdit.from),
      to: new Date(leaveToEdit.to)
    } : undefined
  );
  const [reason, setReason] = useState(leaveToEdit?.reason || '');

  const { applyForLeave, updateLeave } = useLeaveStore();
  const { toast } = useToast();

  useEffect(() => {
    if (leaveToEdit) {
      setLeaveType(leaveToEdit.leave_type.name);
      setDateRange({
        from: new Date(leaveToEdit.from),
        to: new Date(leaveToEdit.to)
      });
      setReason(leaveToEdit.reason || '');
    }
  }, [leaveToEdit]);

  const calculateDays = () => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = () => {
    if (!leaveType || !dateRange?.from || !dateRange?.to) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (leaveToEdit) {
      updateLeave({
        ...leaveToEdit,
        leave_type: {
          ...leaveToEdit.leave_type,
          name: leaveType
        },
        from: format(dateRange.from, 'yyyy-MM-dd'),
        to: format(dateRange.to, 'yyyy-MM-dd'),
        reason,
        updated_at: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Leave request updated successfully",
      });
    } else {
      const formData: ApplyLeave = {
        from: dateRange.from,
        to: dateRange.to,
        reason: reason,
        type: leaveType,
      }
      axios.post<Res<Leave>>('/leave', formData).then((res) => {
        applyForLeave(res.data.data)
      })

      toast({
        title: "Success",
        description: "Leave application submitted successfully",
      });
    }

    handleCloseDialog();
    onSuccess?.();
  };

  const handleCloseDialog = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            {isAdmin ? 'New Leave Entry' : 'Apply for Leave'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {leaveToEdit ? 'Edit Leave Request' : isAdmin ? 'Create Leave Entry' : 'Apply for Leave'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="leaveType">Leave Type</Label>
            <Select value={leaveType} onValueChange={setLeaveType}>
              <SelectTrigger id="leaveType">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vacation Leave">Vacation Leave</SelectItem>
                <SelectItem value="Mandatory/Forced Leave">Mandatory/Forced Leave</SelectItem>
                <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                <SelectItem value="Paternity Leave">Paternity Leave</SelectItem>
                <SelectItem value="Special Privilege Leave">Special Privilege Leave</SelectItem>
                <SelectItem value="Solo Parent Leave">Solo Parent Leave</SelectItem>
                <SelectItem value="Study Leave">Study Leave</SelectItem>
                <SelectItem value="10-Day VAWC Leave">10-Day VAWC Leave</SelectItem>
                <SelectItem value="Rehabilitation Privilege Leave">Rehabilitation Privilege Leave</SelectItem>
                <SelectItem value="Special Leave Benefits for Women">Special Leave Benefits for Women</SelectItem>
                <SelectItem value="Special Emergency (Calamity) Leave">Special Emergency (Calamity) Leave</SelectItem>
                <SelectItem value="Adoption Leave">Adoption Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Leave Period</Label>
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>

          {dateRange?.from && dateRange?.to && (
            <div className="text-sm text-muted-foreground">
              Duration: {calculateDays()} day(s)
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide details about your leave request"
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {leaveToEdit ? 'Update' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveApplicationDialog;