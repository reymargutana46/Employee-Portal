/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect } from "react"
import { useClassScheduleStore } from "@/store/useClassScheduleStore"
import { useNotificationStore } from "@/store/useNotificationStore"
import { ClassScheduleApproval } from "@/components/ClassScheduleApproval"
import { ScheduleCreator } from "@/components/ScheduleCreator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const WorkloadPage = () => {
  const { userRoles } = useAuth()
  const { markNotificationsByUrlAsRead } = useNotificationStore()
  const {
    fetchSchedules,
    fetchMyCreatedSchedules,
    myCreatedSchedules
  } = useClassScheduleStore()
  
  const isPrincipal = userRoles.some((role) => role.name.toLowerCase() === "principal")
  const isGradeLeader = userRoles.some((role) => role.name.toLowerCase() === "gradeleader")

  useEffect(() => {
    // Fetch schedules for principal
    if (isPrincipal) {
      fetchSchedules()
      // Mark related notifications as read when Principal accesses this page
      markNotificationsByUrlAsRead('/workload')
    }
    
    // Fetch created schedules for grade leaders
    if (isGradeLeader) {
      fetchMyCreatedSchedules()
    }
  }, [isPrincipal, isGradeLeader, fetchSchedules, fetchMyCreatedSchedules, markNotificationsByUrlAsRead])

  // Show content for principals (approval) and grade leaders (creation)
  if (isPrincipal) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Principal view - show Class Schedule Approval with integrated workload stats */}
        <ClassScheduleApproval />
      </div>
    )
  }

  if (isGradeLeader) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Grade Leader view - show Create Schedule button and their created schedules */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Workload Management</h1>
            <p className="text-muted-foreground">Create and manage class schedules</p>
          </div>
          <ScheduleCreator />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">My Created Class Schedules</h2>
          {myCreatedSchedules.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    No class schedules created yet. Use the "Create Schedule" button to get started.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myCreatedSchedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{schedule.grade_section}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {schedule.school_year} • {schedule.adviser_teacher}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          schedule.status === 'APPROVED' 
                            ? 'bg-green-100 text-green-800' 
                            : schedule.status === 'REJECTED' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {schedule.status}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm">
                      <span>Learners: {schedule.total_learners} (M: {schedule.male_learners}, F: {schedule.female_learners})</span>
                      <span>Created: {new Date(schedule.created_at).toLocaleDateString()}</span>
                    </div>
                    {schedule.status === 'PENDING' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        This schedule is pending approval from the Principal. Once approved, it will be sent to the respective teachers.
                      </p>
                    )}
                    {schedule.status === 'APPROVED' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        This schedule has been approved by the Principal and sent to the respective teachers.
                      </p>
                    )}
                    {schedule.status === 'REJECTED' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        This schedule has been rejected by the Principal. {schedule.approval_remarks && `Reason: ${schedule.approval_remarks}`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // For other roles, show permission denied message
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

export default WorkloadPage