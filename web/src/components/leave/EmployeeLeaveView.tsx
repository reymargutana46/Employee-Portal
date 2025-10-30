import React from "react";
import { Leave } from "@/types/leave";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EmployeeLeaveTable from "./EmployeeLeaveTable";
import LeaveHistoryTable from "./LeaveHistoryTable";
import { useAuth } from "@/context/AuthContext";

interface EmployeeLeaveViewProps {
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  personalLeaves: Leave[];
  totalLeaveCount?: number;
  isLoading: boolean;
  onEdit: (leave: Leave) => void;
  onCancel: (id: number) => void;
  onView: (leave: Leave) => void;
}

const EmployeeLeaveView = ({
  totalPages,
  currentPage,
  personalLeaves,
  totalLeaveCount,
  isLoading,
  onEdit,
  onCancel,
  onView,
  setCurrentPage,
}: EmployeeLeaveViewProps) => {
  const { userRoles } = useAuth();
  const isStaff = userRoles.some(role => role.name.toLowerCase() === 'staff');
  // Use totalLeaveCount if provided, otherwise fallback to personalLeaves.length
  const displayCount = totalLeaveCount !== undefined ? totalLeaveCount : personalLeaves.length;

  return (
    <Tabs defaultValue="requests">
      <TabsList>
        <TabsTrigger value="requests">My Requests</TabsTrigger>
      </TabsList>
      <TabsContent value="requests" className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>
              My Leave Requests {isStaff && `(${displayCount})`}
            </CardTitle>
            <CardDescription>Track your leave applications</CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeLeaveTable
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              currentPage={currentPage}
              leaves={personalLeaves}
              isLoading={isLoading}
              onEdit={onEdit}
              onCancel={onCancel}
              onView={onView}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default EmployeeLeaveView;