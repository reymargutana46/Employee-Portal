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
  isLoading: boolean;
  onApprove: (id: number) => void;
  onReject: (leave: Leave) => void;
  onEdit: (leave: Leave) => void;
  onView: (leave: Leave) => void;
  totalLeaveCount?: number;
  onFilterStatus: (status?: "Pending" | "Approved" | "Rejected") => void;
}

const AdminLeaveView = ({
  totalPages,
  currentPage,
  setCurrentPage,
  leaveRequests,
  isLoading,
  onApprove,
  onReject,
  onEdit,
  onView,
  totalLeaveCount = 0,
  onFilterStatus,
}: AdminLeaveViewProps) => {
  // Calculate counts for each status from all leave requests
  const pendingCount = leaveRequests.filter(request => request.status === "Pending").length;
  const approvedCount = leaveRequests.filter(request => request.status === "Approved").length;
  const disapprovedCount = leaveRequests.filter(request => request.status === "Rejected").length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Leave Requests</CardTitle>
        <CardDescription>
          Process and review employee leave requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onFilterStatus(undefined)}
          >
            All ({totalLeaveCount})
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
            onClick={() => onFilterStatus("Rejected")}
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