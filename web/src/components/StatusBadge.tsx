import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import type { RequestStatus } from "@/types/serviceRequest";

interface StatusBadgeProps {
  status: RequestStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "Pending":
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 hover:bg-amber-100"
        >
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>
      );
    case "For Approval":
      return (
        <Badge
          variant="outline"
          className="bg-lime-200 text-neutral-800 hover:bg-amber-100"
        >
          <Clock className="mr-1 h-3 w-3" /> For Approval
        </Badge>
      );
    case "In Progress":
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 hover:bg-blue-100"
        >
          <Clock className="mr-1 h-3 w-3" /> In Progress
        </Badge>
      );
    case "Completed":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 hover:bg-green-100"
        >
          <CheckCircle className="mr-1 h-3 w-3" /> Completed
        </Badge>
      );
    case "Disapproved":
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 hover:bg-red-100"
        >
          <XCircle className="mr-1 h-3 w-3" /> Disapproved
        </Badge>
      );
  }
}
