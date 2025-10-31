
import React from "react";
import dayjs from "dayjs";
import { Leave } from "@/types/leave";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaveHistoryTableProps {
  leaves: Leave[];
  isLoading: boolean;
}

const LoadingTableRow = ({ cols }: { cols: number }) => (
  <TableRow>
    {Array(cols)
      .fill(0)
      .map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 w-[100px]" />
        </TableCell>
      ))}
  </TableRow>
);

const LoadingTable = ({ rows, cols }: { rows: number; cols: number }) => (
  <>
    {Array(rows)
      .fill(0)
      .map((_, i) => (
        <LoadingTableRow key={i} cols={cols} />
      ))}
  </>
);

const LeaveHistoryTable = ({ leaves, isLoading }: LeaveHistoryTableProps) => {
  const filteredLeaves = leaves.filter((leave) => leave.status !== "Pending");
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Leave Type</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead>Days</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Reason</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <LoadingTable rows={5} cols={5} />
        ) : filteredLeaves.length > 0 ? (
          filteredLeaves.map((leave) => (
            <TableRow key={leave.id}>
              <TableCell>{leave.leave_type.name}</TableCell>
              <TableCell>
                {leave.from} to {leave.to}
              </TableCell>
              <TableCell>
                {dayjs(leave.to).diff(dayjs(leave.from), "days") + 1}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    leave.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {leave.status}
                </span>
              </TableCell>
              <TableCell>
                {leave.status === "Disapproved" && leave.leave_rejection
                  ? leave.leave_rejection.rejreason
                  : leave.reason || "-"}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={5}
              className="py-6 text-center text-muted-foreground"
            >
              No leave history found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default LeaveHistoryTable;
