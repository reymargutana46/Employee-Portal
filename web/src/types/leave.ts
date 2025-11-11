import { Employee } from "./employee";

export interface LeaveRejection {
    id: number;
    rejected_by: string;
    leave_id: number;
    created_at: string;
    updated_at: string;
    rejreason: string;
}
export type LeaveStatus = "Pending" | "Approved" | "Disapproved";

export interface Leave {
    id: number;
    from: string;
    to: string;
    reason: string;
    status: LeaveStatus;
    type_id: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    leave_rejection: LeaveRejection | null;
    employee: Employee
    leave_type: LeaveType
}

export interface LeaveType {
    id: number,
    name: string,
    created_at: string;
    updated_at: string;
}

export interface ApplyLeave {
    type: string,
    reason: string | undefined,
    from: Date,
    to: Date
}