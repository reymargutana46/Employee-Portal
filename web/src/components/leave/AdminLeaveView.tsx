import React from "react";
import { Leave } from "@/types/leave";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import AdminLeaveTable from "./AdminLeaveTable";

interface AdminLeaveViewProps {
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  leaveRequests: Leave[];
  allLeaveRequests?: Leave[]; // Make it optional to maintain backward compatibility
  isLoading: boolean;
  onApprove: (id: number) => void;
  onReject: (leave: Leave) => void;
  onEdit: (leave: Leave) => void;
  onView: (leave: Leave) => void;
  totalLeaveCount?: number;
  onFilterStatus: (status?: "Pending" | "Approved" | "Disapproved") => void;
}

const AdminLeaveView = ({
  totalPages,
  currentPage,
  setCurrentPage,
  leaveRequests,
  allLeaveRequests, // Destructure the new prop
  isLoading,
  onApprove,
  onReject,
  onEdit,
  onView,
  totalLeaveCount = 0,
  onFilterStatus,
}: AdminLeaveViewProps) => {
  // Calculate counts for each status from all leave requests (not just the filtered ones)
  // Use allLeaveRequests if available, otherwise fall back to leaveRequests
  const requestsToCount = allLeaveRequests || leaveRequests;
  
  // More robust counting that handles both old "Rejected" and new "Disapproved" statuses
  let pendingCount = 0;
  let approvedCount = 0;
  let disapprovedCount = 0;
  
  requestsToCount.forEach(request => {
    switch (request.status) {
      case "Pending":
        pendingCount++;
        break;
      case "Approved":
        approvedCount++;
        break;
      case "Disapproved":
        disapprovedCount++;
        break;
      default:
        // Handle legacy "Rejected" status for backward compatibility
        // Even though it's not in the type definition, it might exist in the database
        // Type assertion to handle the case where status might be "Rejected" in the data
        if ((request.status as string) === "Rejected") {
          disapprovedCount++;
        } else {
          // Log any unexpected status values for debugging
          console.warn("Unexpected leave status:", request.status, request);
        }
        break;
    }
  });
  
  const totalCount = pendingCount + approvedCount + disapprovedCount;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Leave Requests</CardTitle>
            <CardDescription>
              {totalLeaveCount} total leave requests
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onFilterStatus(undefined)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            All ({totalCount})
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onFilterStatus("Pending")}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          >
            Pending ({pendingCount})
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onFilterStatus("Approved")}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            Approved ({approvedCount})
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onFilterStatus("Disapproved")}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Disapproved ({disapprovedCount})
          </Button>
        </div>
        <AdminLeaveTable
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          currentPage={currentPage}
          leaveRequests={leaveRequests}
          isLoading={isLoading}
          onApprove={onApprove}
          onReject={onReject}
          onEdit={onEdit}
          onView={onView}
        />
      </CardContent>
    </Card>
  );
};

export default AdminLeaveView;