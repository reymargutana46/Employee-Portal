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
  
  // Helper function to check if a value is truly empty or just a zero
  const isValueEmpty = (value: any): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (typeof value === 'number' && (isNaN(value) || value === 0)) return true;
    if (typeof value === 'string' && value.trim() === '0') return true;
    return false;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{request.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mt-1">
              {request.type && (
                <span className="text-sm text-muted-foreground">{request.type}</span>
              )}
              <PriorityBadge priority={request.priority} />
            </div>
          </div>
          <StatusBadge status={request.status} />
        </div>

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
              <p>{format(new Date(request.fromDate), "PPP")}</p>
            </div>
            <div>
              <p className="text-sm font-medium">To Date</p>
              <p>{format(new Date(request.toDate), "PPP")}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Description</p>
            {!isValueEmpty(request.details) ? (
              <p className="mt-1">{request.details.toString()}</p>
            ) : (
              <p className="mt-1 text-muted-foreground italic">No description provided</p>
            )}
          </div>

          {request.rating && request.rating > 0 && (
            <div>
              <p className="text-sm font-medium">Rating</p>
              <div className="flex items-center mt-1">
                <StarRating rating={request.rating} />
                <span className="ml-2">{request.rating}/5</span>
              </div>
            </div>
          )}

          {!isValueEmpty(request.remarks) && (
            <div>
              <p className="text-sm font-medium">Remarks</p>
              <p className="mt-1">{request.remarks.toString()}</p>
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
          
          {/* For the receiver - can start if pending and assigned to them */}
          {request.status === "Pending" &&
            request.requestToId === String(user.employee_id) && (
              <Button onClick={() => onUpdateStatus(request.id, "In Progress")}>
                Start Work
              </Button>
            )}
          
          {/* For the Principal - can approve or disapprove if For Approval */}
          {request.status === "For Approval" &&
            canDoAction(["Principal"]) && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onUpdateStatus(request.id, "Disapproved")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Disapprove
                </Button>
                <Button onClick={() => onUpdateStatus(request.id, "Pending")}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}

          {/* For the receiver - can mark as completed if in progress */}
          {request.status === "In Progress" &&
            request.requestToId === String(user.employee_id) && (
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