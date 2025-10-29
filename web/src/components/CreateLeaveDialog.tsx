import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from './DateRangePicker';
import axios from "../utils/axiosInstance";
import { ApplyLeave } from '@/types/leave';

interface CreateLeaveDialogProps {
  open?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const CreateLeaveDialog = ({ open, onClose, onSuccess, trigger }: CreateLeaveDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const actualOpen = open ?? isOpen;
  const actualOnClose = onClose ?? (() => setIsOpen(false));
  
  const [leaveType, setLeaveType] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reason, setReason] = useState("");
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

  const calculateDays = () => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async () => {
    if (!leaveType || !dateRange?.from || !dateRange?.to) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (reason.length < 15) {
      toast({
        title: "Error",
        description: "Reason must be at least 15 characters long",
        variant: "destructive"
      });
      return;
    }

    // Format dates to YYYY-MM-DD format for the backend
    const formattedFrom = dateRange.from.toISOString().split('T')[0];
    const formattedTo = dateRange.to.toISOString().split('T')[0];

    // Create the leave data object
    const leaveData = {
      type: leaveType,
      reason: reason,
      from: formattedFrom,
      to: formattedTo
    };

    try {
      console.log("Submitting leave request to /leaves:", leaveData);
      // Log the full URL that will be used
      console.log("Full request URL would be:", `${axios.defaults.baseURL}/leaves`);
      
      const response = await axios.post('/leaves', leaveData);
      console.log("Leave request response:", response);

      toast({
        title: "Success",
        description: "Leave request submitted successfully"
      });

      // Reset form
      setLeaveType("");
      setDateRange(undefined);
      setReason("");
      
      actualOnClose();
      setIsOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Leave submission error:", error);
      let errorMessage = "Failed to submit leave request";
      
      if (error.response) {
        // Server responded with error status
        console.error("Error response:", error.response);
        if (error.response.status === 404) {
          errorMessage = `API endpoint not found (${error.response.status}). Please check if the backend server is running and accessible.`;
        } else if (error.response.status === 401) {
          errorMessage = "Unauthorized. Please log in again.";
        } else if (error.response.status === 400) {
          errorMessage = "Bad request. Please check your input data.";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Server error (${error.response.status}). Please try again.`;
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error("Error request:", error.request);
        errorMessage = "Network error. Please check if the backend server is running and accessible.";
      } else {
        console.error("Error message:", error.message);
        errorMessage = `Request failed: ${error.message}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setLeaveType("");
      setDateRange(undefined);
      setReason("");
    }
    if (open === undefined) {
      setIsOpen(newOpen);
    }
    if (!newOpen && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={actualOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            Apply for Leave
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Leave Request</DialogTitle>
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
                  <SelectItem key={index} value={type} className='capitalize'>
                    {type}
                  </SelectItem>
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
            <Textarea
              id="reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Provide details (minimum 15 characters)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={actualOnClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLeaveDialog;