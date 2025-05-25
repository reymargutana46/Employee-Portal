

import type React from "react"

import { parseISO, format, isSameDay } from "date-fns"
import type { Workload } from "@/types/workload"
import { Badge } from "@/components/ui/badge"
import { CalendarRange } from "lucide-react"

interface WorkloadItemProps {
  workload: Workload
  day?: Date
  onClick: (e: React.MouseEvent) => void
}

export function WorkloadItem({ workload, day, onClick }: WorkloadItemProps): React.ReactElement {
  // Get the correct schedule dates based on workload type
  let schedFrom: Date
  let schedTo: Date
  let isMultiDay = false

  if (workload.type === "FACULTY" && workload.faculty_w_l) {
    schedFrom = parseISO(workload.faculty_w_l.sched_from)
    schedTo = parseISO(workload.faculty_w_l.sched_to)
  } else if (workload.type === "STAFF" && workload.staff_w_l) {
    schedFrom = parseISO(workload.staff_w_l.sched_from)
    schedTo = parseISO(workload.staff_w_l.sched_to)
  } else {
    // Fallback to workload from/to if no specific schedule
    schedFrom = parseISO(workload.from)
    schedTo = parseISO(workload.to)
  }

  // Check if this is a multi-day workload
  if (schedFrom.toDateString() !== schedTo.toDateString()) {
    isMultiDay = true
  }

  // For multi-day workloads, show different information based on which day we're viewing
  const isFirstDay = day ? isSameDay(day, schedFrom) : false
  const isLastDay = day ? isSameDay(day, schedTo) : false

  const getWorkloadColor = (type: string): string => {
    return type === "FACULTY"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
  }

  return (
    <div className="p-2 rounded-md text-xs cursor-pointer hover:bg-muted transition-colors" onClick={onClick}>
      <div className="flex justify-between items-start">
        <span className="font-medium truncate">{workload.title}</span>
        <Badge variant="outline" className={getWorkloadColor(workload.type)}>
          {workload.type === "FACULTY" ? "Class" : "Admin"}
        </Badge>
      </div>

      {isMultiDay ? (
        <div className="text-muted-foreground mt-1 flex items-center">
          <CalendarRange className="h-3 w-3 mr-1" />
          {isFirstDay ? (
            <span>Starts: {format(schedFrom, "h:mm a")}</span>
          ) : isLastDay ? (
            <span>Ends: {format(schedTo, "h:mm a")}</span>
          ) : (
            <span>All day</span>
          )}
        </div>
      ) : (
        <div className="text-muted-foreground mt-1">
          {format(schedFrom, "h:mm a")} - {format(schedTo, "h:mm a")}
        </div>
      )}

      {workload.type === "FACULTY" && workload.faculty_w_l && (
        <div className="mt-1 text-muted-foreground">{workload.faculty_w_l.room?.name || "No room"}</div>
      )}
    </div>
  )
}
