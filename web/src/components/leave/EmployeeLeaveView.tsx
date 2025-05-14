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

interface EmployeeLeaveViewProps {
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  personalLeaves: Leave[];
  isLoading: boolean;
  onEdit: (leave: Leave) => void;
  onCancel: (id: number) => void;
  onView: (leave: Leave) => void;
}

const EmployeeLeaveView = ({
  totalPages,
  currentPage,
  personalLeaves,
  isLoading,
  onEdit,
  onCancel,
  onView,
  setCurrentPage,
}: EmployeeLeaveViewProps) => {
  console.log(personalLeaves);
  return (
    <Tabs defaultValue="requests">
      <TabsList>
        <TabsTrigger value="requests">My Requests</TabsTrigger>
      </TabsList>
      <TabsContent value="requests" className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>My Leave Requests</CardTitle>
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
