import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useClassScheduleStore } from "@/store/useClassScheduleStore"
import { useNotificationStore } from "@/store/useNotificationStore"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle, Loader2, Eye } from "lucide-react"
import type { ClassSchedule } from "@/types/classSchedule"
import { ScheduleDetailView } from "./ScheduleDetailView"

export function ClassScheduleApproval() {
  const { schedules, fetchSchedules, approveSchedule, rejectSchedule } = useClassScheduleStore()
  const { markNotificationsByUrlAsRead } = useNotificationStore()
  const { toast } = useToast()
  const [remarks, setRemarks] = useState<Record<number, string>>({})
  const [isProcessing, setIsProcessing] = useState<Record<number, boolean>>({})
  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null)
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)

  useEffect(() => {
    fetchSchedules()
    // Mark notifications as read when Principal accesses the approval page
    markNotificationsByUrlAsRead('/workload')
  }, [fetchSchedules, markNotificationsByUrlAsRead])

  const pendingSchedules = schedules.filter(s => s.status === 'PENDING')

  const handleRemarksChange = (scheduleId: number, value: string) => {
    setRemarks(prev => ({ ...prev, [scheduleId]: value }))
  }

  const setProcessingState = (scheduleId: number, processing: boolean) => {
    setIsProcessing(prev => ({ ...prev, [scheduleId]: processing }))
  }

  const handleViewSchedule = (schedule: ClassSchedule) => {
    setSelectedSchedule(schedule)
    setIsDetailViewOpen(true)
  }

  const handleApprove = async (schedule: ClassSchedule) => {
    setProcessingState(schedule.id, true)
    try {
      await approveSchedule(schedule.id, { remarks: remarks[schedule.id] || '' })
      
      // Mark any related notifications as read
      markNotificationsByUrlAsRead('/workload')
      markNotificationsByUrlAsRead('/schedule')
      
      toast({
        title: "Schedule Approved",
        description: `Class schedule for ${schedule.grade_section} has been approved and teachers have been notified.`,
      })
      // Clear remarks for this schedule
      setRemarks(prev => ({ ...prev, [schedule.id]: '' }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve schedule",
        variant: "destructive",
      })
    } finally {
      setProcessingState(schedule.id, false)
    }
  }

  const handleReject = async (schedule: ClassSchedule) => {
    const scheduleRemarks = remarks[schedule.id] || ''
    if (!scheduleRemarks.trim()) {
      toast({
        title: "Remarks Required",
        description: "Please provide remarks when rejecting a schedule.",
        variant: "destructive",
      })
      return
    }
    setProcessingState(schedule.id, true)
    try {
      await rejectSchedule(schedule.id, { remarks: scheduleRemarks })
      
      // Mark any related notifications as read
      markNotificationsByUrlAsRead('/workload')
      markNotificationsByUrlAsRead('/schedule')
      
      toast({
        title: "Schedule Disapproved",
        description: `Class schedule for ${schedule.grade_section} has been disapproved.`,
      })
      // Clear remarks for this schedule
      setRemarks(prev => ({ ...prev, [schedule.id]: '' }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disapprove schedule",
        variant: "destructive",
      })
    } finally {
      setProcessingState(schedule.id, false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Class Schedule Approvals</h2>
        <p className="text-muted-foreground">Review and approve class schedules created by Grade Leaders</p>
      </div>

      {pendingSchedules.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No pending class schedules for approval
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingSchedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {schedule.grade_section}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSchedule(schedule)}
                        className="ml-2"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Schedule
                      </Button>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {schedule.school_year} • {schedule.adviser_teacher}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {schedule.total_learners} learners ({schedule.male_learners} male, {schedule.female_learners} female) • Created by: {schedule.creator?.fullname || schedule.created_by}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(schedule.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">PENDING</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Remarks (optional for approval, required for rejection)
                    </label>
                    <Textarea
                      placeholder="Add your remarks here..."
                      value={remarks[schedule.id] ?? ''}
                      onChange={(e) => handleRemarksChange(schedule.id, e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => handleReject(schedule)}
                      disabled={!!isProcessing[schedule.id]}
                    >
                      {isProcessing[schedule.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Disapprove
                    </Button>
                    <Button 
                      onClick={() => handleApprove(schedule)} 
                      disabled={!!isProcessing[schedule.id]}
                    >
                      {isProcessing[schedule.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve & Send to Teachers
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedSchedule && (
        <ScheduleDetailView
          schedule={selectedSchedule}
          open={isDetailViewOpen}
          onOpenChange={setIsDetailViewOpen}
        />
      )}
    </div>
  )
}