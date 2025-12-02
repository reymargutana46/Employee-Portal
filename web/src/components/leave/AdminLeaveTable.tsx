import React from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { MoreHorizontal } from "lucide-react";
import { Leave } from "@/types/leave";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PaginationControl from "../PaginationControl";
import { useAuthStore } from "@/store/useAuthStore";

interface AdminLeaveTableProps {
  totalPages: number;
  currentPage: number;
  leaveRequests: Leave[];
  isLoading: boolean;
  onApprove: (id: number) => void;
  onReject: (leave: Leave) => void;
  onEdit: (leave: Leave) => void;
  onView: (leave: Leave) => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage?: number;
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

const AdminLeaveTable = ({
  totalPages,
  currentPage,
  setCurrentPage,
  leaveRequests,
  isLoading,
  onApprove,
  onReject,
  onEdit,
  onView,
  itemsPerPage = 10,
}: AdminLeaveTableProps) => {
  const canDoAction = useAuthStore((state) => state.canDoAction);
  
  // Paginate the leave requests
  const paginatedRequests = leaveRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <LoadingTable rows={5} cols={7} />
          ) : paginatedRequests.length > 0 ? (
            paginatedRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.employee.fname}</TableCell>
                <TableCell>{request.leave_type.name}</TableCell>
                <TableCell>
                  {dayjs(request.from).format("MMM D, YYYY")} to{" "}
                  {dayjs(request.to).format("MMM D, YYYY")}
                </TableCell>
                <TableCell>
                  {dayjs(request.to).diff(dayjs(request.from), "days") + 1}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      request.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : request.status === "Pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {request.status === "Disapproved" ? "Disapproved" : request.status}
                  </span>
                  {request.status === "Disapproved" && request.leave_rejection && (
                    <span className="block text-xs text-red-600 mt-1">
                      Reason: {request.leave_rejection.rejreason}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(request.created_at).toLocaleDateString()}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {request.status === "Pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1 bg-green-400"
                          onClick={() => onApprove(request.id)}
                        >
                          <span>Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1 bg-red-500"
                          onClick={() => onReject(request)}
                        >
                          <span>Disapprove</span>
                        </Button>
                      </>
                    )}
                    {canDoAction([
                      "admin",
                      "faculty",
                      "staff",
                    ]) && (
                      <>
                        {request.status === "Pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => onEdit(request)}
                          >
                            <span>Edit</span>
                          </Button>
                        )}
                      </>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(request)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onView(request)}>
                          Print Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-6 text-center text-muted-foreground"
              >
                No leave requests found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="mt-4">
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default AdminLeaveTable;