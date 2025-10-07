import { Employee } from "./employee";

export type WorkloadType = "FACULTY" | "STAFF"

export interface FacultyWorkload {
  id: string;
  acadyearId: number;
  classId: string;
  workload_id: number;
  subject: string;
  sched_from: string; // ISO datetime string
  sched_to: string;   // ISO datetime string
  quarter: string;
  room_id: string;
  room: Room | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workload {
  id: string;
  title: string;

  from: string; // ISO datetime string
  to: string;   // ISO datetime string
  assignee_id?: string;
  created_by: string;
  type: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  approval_remarks?: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  faculty_w_l: FacultyWorkload | null;
  staff_w_l: StaffWorkload | null;
  employee: Employee;
}

export interface StaffWorkload {
  id: string;
  title: string;
  description: string;
  sched_from: string; // typically an ISO date string
  sched_to: string;
}



export interface Room {
  id: string,
  name: string,
}
