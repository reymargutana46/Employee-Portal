export interface ServiceRequest {
  id: number
  requestor: string
  requestTo: string
  requestToId: string
  title: string
  details: string
  type: string
  status: RequestStatus
  priority: RequestPriority
  createdAt: string
  fromDate: Date
  toDate: Date
  rating?: number
  remarks?: string
}
export type RequestStatus = "Pending" | "In Progress" | "Completed" | "Disapproved" | "For Approval"
export type RequestPriority = "Low" | "Medium" | "High" | "Urgent"

export const requestTypes =
  [
    "Document Request",
    "Facility Request",
    "IT Support",
    "Leave Request",
    "Reimbursement"
  ]