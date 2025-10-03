export interface ScheduleTimeSlot {
  time: string;
  minutes: string;
  mondayThursday: string;
  friday: string;
}

export interface ClassProgram {
  id: number;
  grade_section: string;
  school_year: string;
  adviser_teacher: string;
  male_learners: number;
  female_learners: number;
  total_learners: number;
  schedule_data: ScheduleTimeSlot[];
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  creator?: {
    username: string;
    // Add other user fields as needed
  };
}

export interface ClassProgramFormData {
  grade_section: string;
  school_year: string;
  adviser_teacher: string;
  male_learners: number;
  female_learners: number;
  schedule_data: ScheduleTimeSlot[];
}

export interface CreateClassProgramRequest extends ClassProgramFormData {}

export interface UpdateClassProgramRequest extends Partial<ClassProgramFormData> {}

export interface ClassProgramResponse {
  success: boolean;
  data: ClassProgram;
  message: string;
}

export interface ClassProgramListResponse {
  success: boolean;
  data: ClassProgram[];
  message: string;
}