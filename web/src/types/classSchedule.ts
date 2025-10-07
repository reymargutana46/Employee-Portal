export interface ClassSchedule {
  id: number;
  grade_section: string;
  school_year: string;
  adviser_teacher: string;
  male_learners: number;
  female_learners: number;
  total_learners: number;
  schedule_data: ScheduleRow[];
  created_by: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approval_remarks?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  created_at: string;
  updated_at: string;
  creator?: {
    username: string;
    fullname: string;
  };
  approver?: {
    username: string;
    fullname: string;
  };
  rejector?: {
    username: string;
    fullname: string;
  };
}

export interface ScheduleRow {
  time: string;
  mins: string;
  mondayThursday: string;
  friday: string;
}

export interface CreateClassScheduleRequest {
  grade_section: string;
  school_year: string;
  adviser_teacher: string;
  male_learners: number;
  female_learners: number;
  total_learners: number;
  schedule_data: ScheduleRow[];
}

export interface ApproveScheduleRequest {
  remarks?: string;
}