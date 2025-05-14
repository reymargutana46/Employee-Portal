import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLeaveStore } from "@/store/useLeaveStore";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "./DateRangePicker";
import axios from "../utils/axiosInstance";
import { Res } from "@/types/response";
import { ApplyLeave, Leave } from "@/types/leave";

interface CreateLeaveDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const CreateLeaveDialog = ({ trigger, onSuccess }: CreateLeaveDialogProps) => {
  const [open, setOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reason, setReason] = useState("");
  const { applyForLeave, leaveTypes } = useLeaveStore();
  const { toast } = useToast();

  const calculateDays = () => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    const diffTime = Math.abs(
      dateRange.to.getTime() - dateRange.from.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  function fixDate(date: Date) {
    const year = date.toLocaleString("default", { year: "numeric" });
    const month = date.toLocaleString("default", { month: "2-digit" });
    const day = date.toLocaleString("default", { day: "2-digit" });
    const dateString = year + '-' + month + '-' + day
    return new Date(dateString);
  }

  const handleSubmit = async () => {
    if (!leaveType || !dateRange?.from || !dateRange?.to) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    const formData: ApplyLeave = {
      from: fixDate(dateRange.from),
      to: fixDate(dateRange.to),
      reason: reason,
      type: leaveType,
    };
    try {
      const res = await axios.post<Res<Leave>>("/leaves", formData);
      applyForLeave(res.data.data);
      toast({
        title: "Success",
        description: "Leave application submitted successfully",
      });
      setOpen(false);
      onSuccess?.();
      setLeaveType("");
      setDateRange(undefined);
      setReason("");
    } catch {
      toast({
        title: "Submission error",
        description: "Could not submit leave",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Apply for Leave</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label>Leave Type</Label>
            <Select value={leaveType} onValueChange={setLeaveType}>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>

              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem
                    key={type.id}
                    value={type.name}
                    className="capitalize"
                  >
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
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
          <div>
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide details"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default CreateLeaveDialog;
