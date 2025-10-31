import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLeaveStore } from "@/store/useLeaveStore";
import { Leave, LeaveStatus } from "@/types/leave";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "../utils/axiosInstance";
import { Res } from "@/types/response";
interface LeaveRejectionDialogProps {
  leave: Leave;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRejectSuccess?: () => void;
}

const LeaveRejectionDialog = ({
  leave,
  open,
  onOpenChange,
  onRejectSuccess,
}: LeaveRejectionDialogProps) => {
  const [reason, setReason] = useState("");
  const { rejectLeave } = useLeaveStore();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }
    axios
      .post<Res<Leave>>("/leaves/decision", {
        status: "Disapproved" as LeaveStatus,
        id: leave.id,
        reason,
      })
      .then(() => {
        rejectLeave(leave.id, reason);

        toast({
          title: "Leave Disapproved",
          description: "The leave request has been disapproved with a reason",
        });
      });

    setReason("");
    onOpenChange(false);
    onRejectSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Disapprove Leave Request</DialogTitle>
          <DialogDescription>
            Please provide a reason for disapproving this leave request.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="rejectionReason">Reason for Disapproval</Label>
            <Textarea
              id="rejectionReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter the reason for disapproving this leave request"
              className="resize-none"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit}>
            Disapprove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveRejectionDialog;
