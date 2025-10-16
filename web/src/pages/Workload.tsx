/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect } from "react"
import { useClassScheduleStore } from "@/store/useClassScheduleStore"
import { useNotificationStore } from "@/store/useNotificationStore"
import { ClassScheduleApproval } from "@/components/ClassScheduleApproval"


const WorkloadPage = () => {
  const { userRoles } = useAuth()
  const { markNotificationsByUrlAsRead } = useNotificationStore()
  const {
    fetchSchedules,
  } = useClassScheduleStore()
  
  const isPrincipal = userRoles.some((role) => role.name.toLowerCase() === "principal")

  useEffect(() => {
    // Fetch schedules for principal
    if (isPrincipal) {
      fetchSchedules()
      // Mark related notifications as read when Principal accesses this page
      markNotificationsByUrlAsRead('/workload')
    }
  }, [isPrincipal, fetchSchedules, markNotificationsByUrlAsRead])

  // Only show content for principals
  if (!isPrincipal) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center">
          <p className="text-muted-foreground">
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Principal view - only show Class Schedule Approval */}
      <ClassScheduleApproval />
    </div>
  )
}

export default WorkloadPage