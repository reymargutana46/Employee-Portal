import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useLeaveStore } from "@/store/useLeaveStore";
import { useToast } from "@/hooks/use-toast";
import { Leave, LeaveStatus, LeaveType } from "@/types/leave";
import axios from "../utils/axiosInstance";
import { Res } from "@/types/response";

// Import our new components
import LeaveSearchAndFilter from "@/components/leave/LeaveSearchAndFilter";
import LeaveBalanceCards from "@/components/leave/LeaveBalanceCards";
import AdminLeaveView from "@/components/leave/AdminLeaveView";
import EmployeeLeaveView from "@/components/leave/EmployeeLeaveView";
import LeaveRejectionDialog from "@/components/LeaveRejectionDialog";
import CreateLeaveDialog from "@/components/CreateLeaveDialog";
import EditLeaveDialog from "@/components/EditLeaveDialog";
import ViewLeaveDetailsDialog from "@/components/ViewLeaveDetailsDialog";
import { useAuthStore } from "@/store/useAuthStore";

const LeaveManagement = () => {
  const { userRoles } = useAuth();
  const canDoAction = useAuthStore((state) => state.canDoAction);
  const { toast } = useToast();

  const {
    leaveRequests,
    personalLeaves,
    leaveBalance,
    searchTerm,
    leaveTypes,
    isLoading,
    setLeaveTypes,
    setSearchTerm,
    approveLeave,
    cancelLeave,
    applyFilter,
    resetFilters,
    fetchLeaves,
  } = useLeaveStore();

  const [filteredLeaveRequests, setFilteredLeaveRequests] =
    useState(leaveRequests);
  const [filteredPersonalLeaves, setFilteredPersonalLeaves] =
    useState(personalLeaves);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [activeViewLeave, setActiveViewLeave] = useState<Leave | null>(null);
  const [editLeaveDialogOpen, setEditLeaveDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isAdmin = userRoles.some(
    (role) =>
      role.name === "admin" ||
      role.name === "secretary" ||
      role.name === "principal"
  );

  useEffect(() => {
    if (leaveTypes.length <= 0) {
      axios
        .get<Res<LeaveType[]>>("/leaves/types/all")
        .then((res) => setLeaveTypes(res.data.data));
    }

    fetchLeaves();
  }, [fetchLeaves, leaveTypes.length, setLeaveTypes]);

  useEffect(() => {
    setFilteredLeaveRequests(
      leaveRequests.filter(
        (request) =>
          request.employee.fname
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.employee.lname
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.leave_type.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    setFilteredPersonalLeaves(
      personalLeaves.filter(
        (request) =>
          request.leave_type.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [leaveRequests, personalLeaves, searchTerm]);

  const handleFilterStatus = (status?: "Pending" | "Approved" | "Rejected") => {
    if (status) {
      applyFilter({ status });

      setFilteredLeaveRequests(
        leaveRequests.filter((request) => request.status === status)
      );

      setFilteredPersonalLeaves(
        personalLeaves.filter((request) => request.status === status)
      );

      // Display "Disapproved" instead of "Rejected" in the toast message
      const displayStatus = status === 'Rejected' ? 'Disapproved' : status;
      toast({
        title: "Filter Applied",
        description: `Showing ${displayStatus} leaves only`,
      });
    } else {
      resetFilters();
      setFilteredLeaveRequests(leaveRequests);
      setFilteredPersonalLeaves(personalLeaves);

      toast({
        title: "Filters Cleared",
        description: "Showing all leaves",
      });
    }
  };

  const handleFilterType = (type?: string) => {
    if (type) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      applyFilter({ type: type as any });

      setFilteredLeaveRequests(
        leaveRequests.filter((request) => request.leave_type.name === type)
      );

      setFilteredPersonalLeaves(
        personalLeaves.filter((request) => request.leave_type.name === type)
      );

      toast({
        title: "Filter Applied",
        description: `Showing ${type} leaves only`,
      });
    } else {
      resetFilters();
      setFilteredLeaveRequests(leaveRequests);
      setFilteredPersonalLeaves(personalLeaves);
    }
  };

  const handleDateRangeFilter = (start: Date | null, end: Date | null) => {
    if (start && end) {
      applyFilter({
        dateRange: {
          start,
          end,
        },
      });

      const startTimestamp = start.getTime();
      const endTimestamp = end.getTime();

      setFilteredLeaveRequests(
        leaveRequests.filter((request) => {
          const requestDate = new Date(request.from).getTime();
          return requestDate >= startTimestamp && requestDate <= endTimestamp;
        })
      );

      setFilteredPersonalLeaves(
        personalLeaves.filter((request) => {
          const requestDate = new Date(request.from).getTime();
          return requestDate >= startTimestamp && requestDate <= endTimestamp;
        })
      );

      toast({
        title: "Date Range Applied",
        description: `Showing leaves within the selected date range`,
      });
    } else {
      resetFilters();
      setFilteredLeaveRequests(leaveRequests);
      setFilteredPersonalLeaves(personalLeaves);

      toast({
        title: "Date Range Cleared",
        description: "Showing all leaves",
      });
    }
  };

  const handleApproveLeave = (id: number) => {
    axios
      .post<Res<Leave>>("/leaves/decision", {
        status: "Approved" as LeaveStatus,
        id,
      })
      .then(() => {
        approveLeave(id);
        toast({
          title: "Leave Approved",
          description: "The leave request has been approved",
        });
      });
  };

  const handleRejectLeaveClick = (leave: Leave) => {
    setSelectedLeave(leave);
    setRejectionDialogOpen(true);
  };

  const handleViewLeaveClick = (leave: Leave) => {
    setActiveViewLeave(leave);
    setViewDialogOpen(true);
  };

  const handleEditLeaveClick = (leave: Leave) => {
    setSelectedLeave(leave);
    setEditLeaveDialogOpen(true);
  };

  const handleCancelLeave = (id: number) => {
    cancelLeave(id);
    toast({
      title: "Leave Cancelled",
      description: "Your leave request has been cancelled",
    });
    setCancelDialogOpen(false);
  };

  const totalPages = Math.ceil(filteredLeaveRequests.length / itemsPerPage);
  const paginatedLeaves = filteredLeaveRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // For staff users, we need to paginate their personal leaves separately
  const totalPersonalPages = Math.ceil(filteredPersonalLeaves.length / itemsPerPage);
  const paginatedPersonalLeaves = filteredPersonalLeaves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Leave Management
          </h1>
          <p className="text-muted-foreground">
            {canDoAction(['admin','secretary','principal'])
              ? "Process and manage leave requests from employees"
              : "Submit and track your leave requests"}
          </p>
        </div>
        {canDoAction(['admin', 'faculty', 'staff', 'secretary']) && (
        <CreateLeaveDialog onSuccess={fetchLeaves} />

        )}
      </div>

      {!canDoAction(['admin','secretary','principal']) && <LeaveBalanceCards leaveBalance={leaveBalance} />}

      <LeaveSearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onFilterStatus={handleFilterStatus}
        onFilterType={handleFilterType}
        onDateRangeFilter={handleDateRangeFilter}
      />

      {canDoAction(['principal', 'secretary']) ? (
        <AdminLeaveView
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        currentPage={currentPage}
          leaveRequests={filteredLeaveRequests}
          totalLeaveCount={filteredLeaveRequests.length}
          isLoading={isLoading}
          onApprove={handleApproveLeave}
          onReject={handleRejectLeaveClick}
          onEdit={handleEditLeaveClick}
          onView={handleViewLeaveClick}
          onFilterStatus={handleFilterStatus}
        />
      ) : (
          <EmployeeLeaveView
          setCurrentPage={setCurrentPage}
          totalPages={totalPersonalPages}
          currentPage={currentPage}
          personalLeaves={paginatedPersonalLeaves}
          totalLeaveCount={filteredPersonalLeaves.length}
          isLoading={isLoading}
          onEdit={handleEditLeaveClick}
          onCancel={handleCancelLeave}
          onView={handleViewLeaveClick}
        />
      )}

      {editLeaveDialogOpen &&
        selectedLeave &&
        selectedLeave.status === "Pending" && (
          <EditLeaveDialog
            leave={selectedLeave}
            open={editLeaveDialogOpen}
            isAdmin={canDoAction(['admin','secretary','principal'])}
            onClose={() => {
              setSelectedLeave(null);
              setEditLeaveDialogOpen(false);
            }}
            onSuccess={() => {
              setSelectedLeave(null);
              setEditLeaveDialogOpen(false);
              fetchLeaves();
              toast({
                title: "Success",
                description: "Leave request updated successfully",
              });
            }}
          />
        )}

      {activeViewLeave && (
        <ViewLeaveDetailsDialog
          leave={activeViewLeave}
          open={viewDialogOpen}
          onClose={() => {
            setActiveViewLeave(null);
            setViewDialogOpen(false);
          }}
        />
      )}

      {selectedLeave && (
        <LeaveRejectionDialog
          leave={selectedLeave}
          open={rejectionDialogOpen}
          onOpenChange={setRejectionDialogOpen}
          onRejectSuccess={() => setSelectedLeave(null)}
        />
      )}
    </div>
  );
};

export default LeaveManagement;
