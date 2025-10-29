
import { create } from 'zustand';
import axios from '../utils/axiosInstance'
import { Leave, LeaveStatus, LeaveType } from '@/types/leave';
import { Res } from '@/types/response';

interface LeaveBalance {
  type: string;
  allocated: number;
  used: number;
  remaining: number;
}

interface FilterOptions {
  status?: LeaveStatus;
  type?: LeaveType;
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
}

interface LeaveState {
  leaveRequests: Leave[];
  personalLeaves: Leave[];
  leaveBalance: LeaveBalance[];
  searchTerm: string;
  filters: FilterOptions;
  leaveTypes: LeaveType[];
  isLoading: boolean;

  fetchLeaves: () => void;
  setSearchTerm: (term: string) => void;
  applyFilter: (filter: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  setLeaveTypes: (types: LeaveType[]) => void;

  approveLeave: (id: number) => void;
  rejectLeave: (id: number, reason: string) => void;

  applyForLeave: (leaveRequest: Leave) => void;
  updateLeave: (leaveRequest: Leave) => void;
  cancelLeave: (id: number) => void;
}

export const useLeaveStore = create<LeaveState>((set) => ({
  leaveRequests: [],
  personalLeaves: [],
  leaveTypes: [],
  leaveBalance: [],
  searchTerm: '',
  filters: {},
  isLoading: false,

  fetchLeaves: () => {
    set({ isLoading: true });
    axios.get<Res<Leave[]>>("/leaves")
      .then((res) => {
        const leaves = res.data.data;
        set({
          leaveRequests: leaves,
          personalLeaves: leaves.filter(leave =>
            leave.employee.id === 0 // This will be fixed
          ),
          isLoading: false
        });
      })
      .catch(error => {
        console.error("Error fetching leaves:", error);
        set({ isLoading: false });
      });
  },

  setSearchTerm: (term) => set({ searchTerm: term }),

  applyFilter: (filter) => set((state) => ({
    filters: { ...state.filters, ...filter }
  })),

  resetFilters: () => set({ filters: {} }),

  // Add the missing implementation for setLeaveTypes
  setLeaveTypes: (types) => set({ leaveTypes: types }),

  approveLeave: (id) => set((state) => {
    const updatedRequests = state.leaveRequests.map(request =>
      request.id === id ? { ...request, status: 'Approved' as LeaveStatus } : request
    );

    const updatedPersonalLeaves = state.personalLeaves.map(request =>
      request.id === id ? { ...request, status: 'Approved' as LeaveStatus } : request
    );

    return {
      leaveRequests: updatedRequests,
      personalLeaves: updatedPersonalLeaves
    };
  }),

  rejectLeave: (id, reason) => set((state) => {
    const currentDate = new Date().toISOString();

    const updatedRequests = state.leaveRequests.map(request => {
      if (request.id === id) {
        return {
          ...request,
          status: 'Rejected' as LeaveStatus,
          leave_rejection: {
            id: Math.floor(Math.random() * 10000),
            rejected_by: "Admin User",
            leave_id: id,
            created_at: currentDate,
            updated_at: currentDate,
            rejreason: reason
          }
        };
      }
      return request;
    });

    const updatedPersonalLeaves = state.personalLeaves.map(request => {
      if (request.id === id) {
        return {
          ...request,
          status: 'Rejected' as LeaveStatus,
          leave_rejection: {
            id: Math.floor(Math.random() * 10000),
            rejected_by: "Admin User",
            leave_id: id,
            created_at: currentDate,
            updated_at: currentDate,
            rejreason: reason
          }
        };
      }
      return request;
    });

    return {
      leaveRequests: updatedRequests,
      personalLeaves: updatedPersonalLeaves
    };
  }),

  applyForLeave: (leaveRequest) => set((state) => {
    console.log("Adding leave request:", leaveRequest);

    const updatedLeaveRequests = [...state.leaveRequests, leaveRequest];
    const updatedPersonalLeaves = [...state.personalLeaves, leaveRequest];

    return {
      leaveRequests: updatedLeaveRequests,
      personalLeaves: updatedPersonalLeaves
    };
  }),

  updateLeave: (leaveRequest) => set((state) => {
    const updatedLeaveRequests = state.leaveRequests.map(request =>
      request.id === leaveRequest.id ? leaveRequest : request
    );

    const updatedPersonalLeaves = state.personalLeaves.map(request =>
      request.id === leaveRequest.id ? leaveRequest : request
    );

    return {
      leaveRequests: updatedLeaveRequests,
      personalLeaves: updatedPersonalLeaves
    };
  }),

  cancelLeave: (id) => set((state) => {
    const updatedPersonalLeaves = state.personalLeaves.filter(leave => leave.id !== id);
    const updatedLeaveRequests = state.leaveRequests.filter(leave => leave.id !== id);

    axios.delete(`/leaves/${id}`)
      .catch(error => {
        console.error("Error cancelling leave:", error);
      });

    return {
      personalLeaves: updatedPersonalLeaves,
      leaveRequests: updatedLeaveRequests
    };
  })
}));
