import { useState, useEffect } from "react"
import { useClassScheduleStore } from "@/store/useClassScheduleStore"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Loader2, CheckCircle, XCircle, BriefcaseBusiness } from "lucide-react"
import type { ClassSchedule, ScheduleRow } from "@/types/classSchedule"
import axios from "@/utils/axiosInstance"

interface WorkloadStats {
  all: number
  pending: number
  approved: number
  disapproved: number
}

export function ClassScheduleApproval() {
  const { schedules, isLoading, error, fetchSchedules, approveSchedule, rejectSchedule } = useClassScheduleStore()
  const { toast } = useToast()
  const [approvalRemarks, setApprovalRemarks] = useState<Record<number, string>>({})
  const [isApproving, setIsApproving] = useState<Record<number, boolean>>({})
  const [isRejecting, setIsRejecting] = useState<Record<number, boolean>>({})
  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [workloadStats, setWorkloadStats] = useState<WorkloadStats>({ all: 0, pending: 0, approved: 0, disapproved: 0 })
  const [isLoadingWorkloads, setIsLoadingWorkloads] = useState(true)

  // Filter pending schedules
  const pendingSchedules = schedules.filter(schedule => schedule.status === 'PENDING')

  const fetchWorkloadStats = async () => {
    try {
      setIsLoadingWorkloads(true)
      
      // Use the schedules data that's already being fetched
      // Calculate stats based on all schedules (not just pending)
      const newStats = {
        all: schedules.length,
        pending: schedules.filter(s => s.status === 'PENDING').length,
        approved: schedules.filter(s => s.status === 'APPROVED').length,
        disapproved: schedules.filter(s => s.status === 'REJECTED').length,
      }
      setWorkloadStats(newStats)
      
    } catch (err) {
      console.error('Error calculating schedule stats:', err)
    } finally {
      setIsLoadingWorkloads(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  // Recalculate stats whenever schedules data changes
  useEffect(() => {
    if (schedules.length >= 0) { // Check if schedules data is available (including empty array)
      fetchWorkloadStats()
    }
  }, [schedules])

  const handleApprove = async (scheduleId: number) => {
    setIsApproving(prev => ({ ...prev, [scheduleId]: true }))
    try {
      const remarks = approvalRemarks[scheduleId] || ''
      const result = await approveSchedule(scheduleId, { remarks })
      
      if (result) {
        toast({
          title: "Success",
          description: "Schedule approved successfully",
        })
        // Clear remarks for this schedule
        setApprovalRemarks(prev => {
          const newRemarks = { ...prev }
          delete newRemarks[scheduleId]
          return newRemarks
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to approve schedule",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve schedule",
        variant: "destructive",
      })
    } finally {
      setIsApproving(prev => ({ ...prev, [scheduleId]: false }))
    }
  }

  const handleReject = async (scheduleId: number) => {
    setIsRejecting(prev => ({ ...prev, [scheduleId]: true }))
    try {
      const remarks = approvalRemarks[scheduleId] || ''
      const result = await rejectSchedule(scheduleId, { remarks })
      
      if (result) {
        toast({
          title: "Success",
          description: "Schedule disapproved successfully",
        })
        // Clear remarks for this schedule
        setApprovalRemarks(prev => {
          const newRemarks = { ...prev }
          delete newRemarks[scheduleId]
          return newRemarks
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to disapprove schedule",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disapprove schedule",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(prev => ({ ...prev, [scheduleId]: false }))
    }
  }

  const handleViewSchedule = (schedule: ClassSchedule) => {
    setSelectedSchedule(schedule)
    setIsViewDialogOpen(true)
  }

  const handleRemarksChange = (scheduleId: number, value: string) => {
    setApprovalRemarks(prev => ({
      ...prev,
      [scheduleId]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              Error loading schedules: {error}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Schedule Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All Schedules</CardTitle>
            <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingWorkloads ? '-' : workloadStats.all}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <BriefcaseBusiness className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{isLoadingWorkloads ? '-' : workloadStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{isLoadingWorkloads ? '-' : workloadStats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disapproved</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{isLoadingWorkloads ? '-' : workloadStats.disapproved}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Class Schedule Approval</h1>
        <p className="text-muted-foreground">
          Review and approve pending class schedules
        </p>
      </div>

      {pendingSchedules.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                No pending class schedules for approval.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingSchedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{schedule.grade_section}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {schedule.school_year} • {schedule.adviser_teacher}
                    </p>
                    {schedule.creator && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Created by: {schedule.creator.fullname} ({schedule.creator.username})
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {schedule.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-4">
                  <span>Learners: {schedule.total_learners} (M: {schedule.male_learners}, F: {schedule.female_learners})</span>
                  <span>Created: {new Date(schedule.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewSchedule(schedule)}
                  >
                    View Details
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve Schedule</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p>
                          Are you sure you want to approve the schedule for <strong>{schedule.grade_section}</strong>?
                        </p>
                        <div>
                          <Label htmlFor={`approve-remarks-${schedule.id}`}>
                            Remarks (Optional)
                          </Label>
                          <Textarea
                            id={`approve-remarks-${schedule.id}`}
                            placeholder="Add any remarks for the approval..."
                            value={approvalRemarks[schedule.id] || ''}
                            onChange={(e) => handleRemarksChange(schedule.id, e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              const dialog = document.querySelector('[data-state="open"]')?.closest('[role="dialog"]')
                              if (dialog) {
                                const closeButton = dialog.querySelector('button[aria-label="Close"]')
                                if (closeButton) (closeButton as HTMLButtonElement).click()
                              }
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => {
                              handleApprove(schedule.id)
                              // Close dialog after approval
                              const dialog = document.querySelector('[data-state="open"]')?.closest('[role="dialog"]')
                              if (dialog) {
                                const closeButton = dialog.querySelector('button[aria-label="Close"]')
                                if (closeButton) (closeButton as HTMLButtonElement).click()
                              }
                            }}
                            disabled={isApproving[schedule.id]}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isApproving[schedule.id] ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                    <XCircle className="h-4 w-4 mr-2" />
                        Disapprove
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Disapprove Schedule</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p>
                          Are you sure you want to disapprove the schedule for <strong>{schedule.grade_section}</strong>?
                        </p>
                        <div>
                          <Label htmlFor={`reject-remarks-${schedule.id}`}>
                            Remarks (Required)
                          </Label>
                          <Textarea
                            id={`reject-remarks-${schedule.id}`}
                            placeholder="Please provide a reason for disapproval..."
                            value={approvalRemarks[schedule.id] || ''}
                            onChange={(e) => handleRemarksChange(schedule.id, e.target.value)}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              const dialog = document.querySelector('[data-state="open"]')?.closest('[role="dialog"]')
                              if (dialog) {
                                const closeButton = dialog.querySelector('button[aria-label="Close"]')
                                if (closeButton) (closeButton as HTMLButtonElement).click()
                              }
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => {
                              if (!approvalRemarks[schedule.id]?.trim()) {
                                toast({
                                  title: "Validation Error",
                                  description: "Remarks are required for disapproval",
                                  variant: "destructive",
                                })
                                return
                              }
                              handleReject(schedule.id)
                              // Close dialog after rejection
                              const dialog = document.querySelector('[data-state="open"]')?.closest('[role="dialog"]')
                              if (dialog) {
                                const closeButton = dialog.querySelector('button[aria-label="Close"]')
                                if (closeButton) (closeButton as HTMLButtonElement).click()
                              }
                            }}
                            disabled={isRejecting[schedule.id] || !approvalRemarks[schedule.id]?.trim()}
                          >
                            {isRejecting[schedule.id] ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Disapproving...
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Disapprove
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">
              CLASS PROGRAM
            </DialogTitle>
          </DialogHeader>

          {selectedSchedule && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Grade & Section</Label>
                  <div className="font-medium">{selectedSchedule.grade_section}</div>
                </div>
                <div>
                  <Label>School Year</Label>
                  <div className="font-medium">{selectedSchedule.school_year}</div>
                </div>
                <div>
                  <Label>Adviser / Class Teacher</Label>
                  <div className="font-medium">{selectedSchedule.adviser_teacher}</div>
                </div>
                <div>
                  <Label>No. of Learners</Label>
                  <div className="font-medium">
                    {selectedSchedule.total_learners} (M: {selectedSchedule.male_learners}, F: {selectedSchedule.female_learners})
                  </div>
                </div>
              </div>

              {/* Schedule Table */}
              <div className="overflow-x-auto border rounded-md">
                <table className="w-full border-collapse text-sm text-center table-fixed">
                  <colgroup>
                    <col className="w-[110px]" /> {/* Time */}
                    <col className="w-[60px]" />  {/* Mins */}
                    <col className="w-[220px]" /> {/* Mon–Thu */}
                    <col className="w-[220px]" /> {/* Friday */}
                  </colgroup>

                  <thead>
                    <tr className="bg-gray-100">
                      <th rowSpan={2} className="border px-2 py-1">Time</th>
                      <th rowSpan={2} className="border px-2 py-1">Mins</th>
                      <th colSpan={2} className="border px-2 py-1">Learning Areas</th>
                    </tr>
                    <tr className="bg-gray-50">
                      <th className="border px-2 py-1">Monday–Thursday</th>
                      <th className="border px-2 py-1">Friday</th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* Morning Session */}
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="border px-2 py-1 font-semibold text-left">
                        MORNING SESSION
                      </td>
                    </tr>

                    {/* Schedule Rows */}
                    {selectedSchedule.schedule_data.map((row: ScheduleRow, index: number) => (
                      <tr key={index}>
                        <td className="border px-2 py-1">{row.time}</td>
                        <td className="border px-2 py-1">{row.mins}</td>
                        <td className="border px-2 py-1">{row.mondayThursday}</td>
                        <td className="border px-2 py-1">{row.friday}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}