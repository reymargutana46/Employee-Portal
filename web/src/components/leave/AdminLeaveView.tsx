import React from "react";
import { Leave } from "@/types/leave";
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
}: AdminLeaveViewProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Leave Requests</CardTitle>
        <CardDescription>
          Process and review employee leave requests
        </CardDescription>
      </CardHeader>
      <CardContent>
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
