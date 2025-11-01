export interface DTRList {
  am_id: number,
  pm_id: number,
  employee_id: number,
  leave_id: number,
  employee: string;
  date: string;
  am_arrival: string,
  am_departure: string,
  pm_arrival: string,
  pm_departure: string,
  status: "Leave" | "Present" | "Absent"
  type: string
}

export type AttendanceStatus = 'Present' | 'Late' | 'Absent';


// export interface DTRList {
//   employee: string;
//   date: string;
//   am_arrival: string,
//   am_departure: string,
//   pm_arrival: string,
//   pm_departure: string,
//   status: "Leave" | "Present"

// }