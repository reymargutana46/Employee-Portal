import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ServiceRequest, RequestStatus } from "@/types/serviceRequest";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StarRating } from "@/components/StarRating";
import { useAuthStore } from "@/store/useAuthStore";

interface ViewRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  request: ServiceRequest;
  onUpdateStatus: (id: number, status: RequestStatus) => void;
  onOpenRating: () => void;
}

export function ViewRequestDialog({
  isOpen,
  onOpenChange,
  request,
  onUpdateStatus,
  onOpenRating,
}: ViewRequestDialogProps) {
  const { canDoAction, user } = useAuthStore();
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>{request.title}</DialogTitle>
            <StatusBadge status={request.status} />
          </div>
          <DialogDescription>
            {request.type} • <PriorityBadge priority={request.priority} />
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div>
                <p className="font-medium">From: {request.requestor}</p>
                <p className="text-sm text-muted-foreground">
                  Submitted: {formatDate(request.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div>
                <p className="font-medium">To: {request.requestTo}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">From Date</p>
              <p>{format(request.fromDate, "PPP")}</p>
            </div>
            <div>
              <p className="text-sm font-medium">To Date</p>
              <p>{format(request.toDate, "PPP")}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Details</p>
            <p className="mt-1">{request.details}</p>
          </div>

          {request.rating > 0 && (
            <div>
              <p className="text-sm font-medium">Rating</p>
              <div className="flex items-center mt-1">
                <StarRating rating={request.rating} />
                <span className="ml-2">{request.rating}/5</span>
              </div>
            </div>
          )}

          {request.remarks && (
            <div>
              <p className="text-sm font-medium">Remarks</p>
              <p className="mt-1">{request.remarks}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          {/* For the requester - can add rating if completed */}
          {request.status === "Completed" &&
            !request.rating &&
            request.requestor === user.username && (
              <Button onClick={onOpenRating}>Add Rating & Remarks</Button>
            )}
          {request.status === "Pending" &&
            !request.rating &&
            request.requestToId === user.employee_id &&
            (
              <Button onClick={() => onUpdateStatus(request.id, "In Progress")}>
                Start
              </Button>
            )}
          {/* For the Principal - can update status if Approve */}

          {request.status === "For Approval" &&
            canDoAction(["principal", "staff"]) &&
            request.requestor === user.username && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onUpdateStatus(request.id, "Rejected")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={() => onUpdateStatus(request.id, "Pending")}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept
                </Button>
              </div>
            )}

          {/* For the receiver - can mark as completed if in progress */}
          {request.status === "In Progress" && (
            <Button onClick={() => onUpdateStatus(request.id, "Completed")}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Completed
            </Button>
          )}

          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
