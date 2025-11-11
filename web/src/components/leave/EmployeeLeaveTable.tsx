import React from "react";
import { Edit, XCircle, MoreHorizontal } from "lucide-react";
import dayjs from "dayjs";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import PaginationControl from "../PaginationControl";

interface EmployeeLeaveTableProps {
  totalPages: number;
  currentPage: number;
  leaves: Leave[];
  isLoading: boolean;
  onEdit?: (leave: Leave) => void;
  onCancel?: (id: number) => void;
  onView: (leave: Leave) => void;
  showActions?: boolean;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
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

const EmployeeLeaveTable = ({
  totalPages,
  currentPage,
  leaves,
  isLoading,
  onEdit,
  onCancel,
  onView,
  setCurrentPage,
  showActions = true,
}: EmployeeLeaveTableProps) => {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Leave Type</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            {showActions && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <LoadingTable rows={5} cols={showActions ? 6 : 5} />
          ) : leaves.length > 0 ? (
            leaves.map((request) => (
              <TableRow key={request.id}>
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
                {showActions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {request.status === "Pending" && onEdit && onCancel && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => onEdit(request)}
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline">
                                <XCircle className="h-4 w-4" />
                                <span>Cancel</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete your{" "}
                                  {request.leave_type.name} Leave data from our
                                  servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onCancel(request.id)}
                                >
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          {/* <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => onCancel(request.id)}
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Cancel</span>
                        </Button> */}
                        </>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(request)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onView(request)}>
                            Print Request
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={showActions ? 6 : 5}
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

export default EmployeeLeaveTable;
