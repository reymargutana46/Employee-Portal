import type React from "react"
import { format, parseISO, isSameDay, differenceInDays } from "date-fns"
import type { Workload } from "@/types/workload"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, CalendarRange } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface DayDetailViewProps {
  date: Date
  workloads: Workload[]
  onSelectWorkload: (workload: Workload) => void
  onClose: () => void
}

export function DayDetailView({ date, workloads, onSelectWorkload, onClose }: DayDetailViewProps): React.ReactElement {
  // Sort workloads by start time
  const sortedWorkloads = [...workloads].sort((a, b) => {
    const aTime = getWorkloadStartTime(a)
    const bTime = getWorkloadStartTime(b)
    return aTime.getTime() - bTime.getTime()
  })

  // Group workloads by type
  const facultyWorkloads = sortedWorkloads.filter((w) => w.type === "FACULTY")
  const staffWorkloads = sortedWorkloads.filter((w) => w.type === "STAFF")

  function getWorkloadStartTime(workload: Workload): Date {
    if (workload.type === "FACULTY" && workload.faculty_w_l) {
      return parseISO(workload.faculty_w_l.sched_from)
    } else if (workload.type === "STAFF" && workload.staff_w_l) {
      return parseISO(workload.staff_w_l.sched_from)
    }
    return parseISO(workload.from)
  }

  function getWorkloadEndTime(workload: Workload): Date {
    if (workload.type === "FACULTY" && workload.faculty_w_l) {
      return parseISO(workload.faculty_w_l.sched_to)
    } else if (workload.type === "STAFF" && workload.staff_w_l) {
      return parseISO(workload.staff_w_l.sched_to)
    }
    return parseISO(workload.to)
  }

  function isMultiDayWorkload(workload: Workload): boolean {
    const startDate = getWorkloadStartTime(workload)
    const endDate = getWorkloadEndTime(workload)
    return startDate.toDateString() !== endDate.toDateString()
  }

  function getWorkloadStatus(workload: Workload): string {
    const startDate = getWorkloadStartTime(workload)
    const endDate = getWorkloadEndTime(workload)

    if (isMultiDayWorkload(workload)) {
      if (isSameDay(startDate, date)) {
        return "Starts today"
      } else if (isSameDay(endDate, date)) {
        return "Ends today"
      } else {
        const totalDays = differenceInDays(endDate, startDate) + 1
        const currentDay = differenceInDays(date, startDate) + 1
        return `Day ${currentDay} of ${totalDays}`
      }
    }
    return ""
  }

  function getWorkloadTimeDisplay(workload: Workload): string {
    const startTime = getWorkloadStartTime(workload)
    const endTime = getWorkloadEndTime(workload)

    if (isMultiDayWorkload(workload)) {
      if (isSameDay(startTime, date)) {
        return `Starts: ${format(startTime, "h:mm a")}`
      } else if (isSameDay(endTime, date)) {
        return `Ends: ${format(endTime, "h:mm a")}`
      } else {
        return "All day"
      }
    }

    return `${format(startTime, "h:mm a")} - ${format(endTime, "h:mm a")}`
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {format(date, "EEEE, MMMM d, yyyy")}
          </DialogTitle>
          <DialogDescription>
            {workloads.length} workload{workloads.length !== 1 ? "s" : ""} scheduled for this day
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 py-4 pr-4">
            {facultyWorkloads.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center">
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 mr-2"
                  >
                    Class
                  </Badge>
                  Faculty Workloads
                </h3>
                {facultyWorkloads.map((workload) => (
                  <WorkloadCard
                    key={workload.id}
                    workload={workload}
                    onClick={() => onSelectWorkload(workload)}
                    timeDisplay={getWorkloadTimeDisplay(workload)}
                    status={getWorkloadStatus(workload)}
                  />
                ))}
              </div>
            )}

            {facultyWorkloads.length > 0 && staffWorkloads.length > 0 && <Separator />}

            {staffWorkloads.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center">
                  <Badge
                    variant="outline"
                    className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 mr-2"
                  >
                    Admin
                  </Badge>
                  Staff Workloads
                </h3>
                {staffWorkloads.map((workload) => (
                  <WorkloadCard
                    key={workload.id}
                    workload={workload}
                    onClick={() => onSelectWorkload(workload)}
                    timeDisplay={getWorkloadTimeDisplay(workload)}
                    status={getWorkloadStatus(workload)}
                  />
                ))}
              </div>
            )}

            {workloads.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">No workloads scheduled for this day</div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface WorkloadCardProps {
  workload: Workload
  onClick: () => void
  timeDisplay: string
  status: string
}

function WorkloadCard({ workload, onClick, timeDisplay, status }: WorkloadCardProps): React.ReactElement {
  const isMultiDay = status !== ""

  return (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onClick}>
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{workload.title}</h4>
            {isMultiDay && (
              <Badge variant="outline" className="text-xs">
                {status}
              </Badge>
            )}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {timeDisplay}
          </div>

          {workload.type === "FACULTY" && workload.faculty_w_l && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              {workload.faculty_w_l.room?.name || "No room assigned"}
              <span className="mx-2">•</span>
              <span>{workload.faculty_w_l.subject}</span>
            </div>
          )}

          {workload.type === "STAFF" && workload.staff_w_l && (
            <div className="text-sm text-muted-foreground">{workload.staff_w_l.description}</div>
          )}

          {isMultiDay && (
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarRange className="h-3 w-3 mr-1" />
              <span>Multi-day workload</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
