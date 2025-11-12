import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from './DateRangePicker';
import { Leave } from '@/types/leave';
import axios from "../utils/axiosInstance"

interface EditLeaveDialogProps {
  leave: Leave;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isAdmin?: boolean;
}

const EditLeaveDialog = ({ leave, open, onClose, onSuccess, isAdmin }: EditLeaveDialogProps) => {
  const [leaveType, setLeaveType] = useState<string>(leave.leave_type.name);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: new Date(leave.from), to: new Date(leave.to) });
  const [reason, setReason] = useState(leave.reason || "");
  const { toast } = useToast();

  // Define the leave types you want to use
  const leaveTypes = [
    "Vacation Leave",
    "Mandatory/Forced Leave",
    "Sick Leave",
    "Maternity Leave",
    "Paternity Leave",
    "Special Privilege Leave",
    "Solo Parent Leave",
    "Study Leave",
    "10-Day VAWC Leave",
    "Rehabilitation Privilege Leave",
    "Special Leave Benefits for Women",
    "Special Emergency (Calamity) Leave",
    "Adoption Leave"
  ];

  useEffect(() => {
    setLeaveType(leave.leave_type.name);
    setDateRange({ from: new Date(leave.from), to: new Date(leave.to) });
    setReason(leave.reason || "");
  }, [leave]);

  const calculateDays = () => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async () => {
    if (!leaveType || !dateRange?.from || !dateRange?.to) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    try {
      const response = await axios.put(`/leaves/${leave.id}`, {
        type: leaveType, 
        from: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : '', 
        to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : '', 
        reason
      })
      console.log("Update response:", response);
      toast({ title: "Success", description: "Leave request updated successfully" });
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Update error:", error);
      toast({  
        title: "Fail", 
        description: error.response?.data?.message || "Leave request updated unsuccessfully",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Leave Request</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label>Leave Type</Label>
            <Select value={leaveType} onValueChange={setLeaveType}>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type, index) => (
                <SelectItem key={index} value={type} className='capitalize'>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Leave Period</Label>
            <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
          </div>
          {dateRange?.from && dateRange?.to && (
            <div className="text-sm text-muted-foreground">
              Duration: {calculateDays()} day(s)
            </div>
          )}
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="Provide details" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditLeaveDialog;