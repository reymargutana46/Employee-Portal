"use client"

import type React from "react"
import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  parseISO,
  isSameDay,
  getDay,
  addDays,
  isBefore,
  isAfter,
} from "date-fns"
import { cn } from "@/lib/utils"
import type { Workload } from "@/types/workload"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronUp, CalendarRange } from "lucide-react"

interface MonthViewProps {
  date: Date
  workloads: Workload[]
  onSelectWorkload: (workload: Workload) => void
  onSelectDate: (date: Date) => void
}

export function MonthView({ date, workloads, onSelectWorkload, onSelectDate }: MonthViewProps): React.ReactElement {
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({})

  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Calculate days needed to fill the grid from previous and next months
  const startDay = getDay(monthStart)
  const daysFromPreviousMonth = startDay === 0 ? 6 : startDay - 1 // Adjust for Monday start (0 = Sunday)

  const previousMonthDays = Array.from({ length: daysFromPreviousMonth }).map((_, i) =>
    addDays(monthStart, -daysFromPreviousMonth + i),
  )

  // Calculate total days in grid (previous month + current month)
  const totalDaysInGrid = previousMonthDays.length + monthDays.length

  // Calculate how many days we need from next month to complete the grid (multiple of 7)
  const remainingDays = 7 - (totalDaysInGrid % 7)
  const nextMonthDays =
    remainingDays === 7 ? [] : Array.from({ length: remainingDays }).map((_, i) => addDays(monthEnd, i + 1))

  // Combine all days
  const calendarDays = [...previousMonthDays, ...monthDays, ...nextMonthDays]

  // Updated function to check if a workload is active on a specific day
  const getWorkloadsForDay = (day: Date): Workload[] => {
    return workloads.filter((workload) => {
      // Get the correct schedule dates based on workload type
      let schedFrom: Date
      let schedTo: Date

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

      // Set time to start of day for date comparison
      const dayStart = new Date(day)
      dayStart.setHours(0, 0, 0, 0)

      const dayEnd = new Date(day)
      dayEnd.setHours(23, 59, 59, 999)

      // Check if the day is within the workload schedule
      return (
        (isSameDay(schedFrom, day) || isBefore(schedFrom, dayStart)) &&
        (isSameDay(schedTo, day) || isAfter(schedTo, dayEnd))
      )
    })
  }

  const toggleDayExpanded = (dayStr: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the day click
    setExpandedDays((prev) => ({
      ...prev,
      [dayStr]: !prev[dayStr],
    }))
  }

  // Helper to check if a workload spans multiple days
  const isMultiDayWorkload = (workload: Workload): boolean => {
    let schedFrom: Date
    let schedTo: Date

    if (workload.type === "FACULTY" && workload.faculty_w_l) {
      schedFrom = parseISO(workload.faculty_w_l.sched_from)
      schedTo = parseISO(workload.faculty_w_l.sched_to)
    } else if (workload.type === "STAFF" && workload.staff_w_l) {
      schedFrom = parseISO(workload.staff_w_l.sched_from)
      schedTo = parseISO(workload.staff_w_l.sched_to)
    } else {
      schedFrom = parseISO(workload.from)
      schedTo = parseISO(workload.to)
    }

    return schedFrom.toDateString() !== schedTo.toDateString()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="text-sm font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const dayStr = day.toISOString()
          const dayWorkloads = getWorkloadsForDay(day)
          const isCurrentMonth = isSameMonth(day, date)
          const isSelected = isSameDay(day, date)
          const dayHasWorkloads = dayWorkloads.length > 0
          const isExpanded = expandedDays[dayStr]

          // Determine how many workloads to show initially
          const initialWorkloadsToShow = 2
          const hasMoreWorkloads = dayWorkloads.length > initialWorkloadsToShow
          const visibleWorkloads = isExpanded ? dayWorkloads : dayWorkloads.slice(0, initialWorkloadsToShow)

          return (
            <Card
              key={dayStr}
              className={cn(
                "min-h-[100px] p-1 relative cursor-pointer hover:bg-muted/50 transition-colors",
                !isCurrentMonth && "opacity-40",
                isSelected && "border-primary",
                isToday(day) && "bg-muted/50",
              )}
              onClick={() => onSelectDate(day)}
            >
              <div className="text-right p-1">
                <span
                  className={cn(
                    "text-sm inline-block w-6 h-6 rounded-full text-center leading-6",
                    isToday(day) && "bg-primary text-primary-foreground font-medium",
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>

              <div className="space-y-1 mt-1">
                {visibleWorkloads.map((workload) => {
                  const isMultiDay = isMultiDayWorkload(workload)

                  // Get schedule dates
                  let schedFrom: Date
                  let schedTo: Date

                  if (workload.type === "FACULTY" && workload.faculty_w_l) {
                    schedFrom = parseISO(workload.faculty_w_l.sched_from)
                    schedTo = parseISO(workload.faculty_w_l.sched_to)
                  } else if (workload.type === "STAFF" && workload.staff_w_l) {
                    schedFrom = parseISO(workload.staff_w_l.sched_from)
                    schedTo = parseISO(workload.staff_w_l.sched_to)
                  } else {
                    schedFrom = parseISO(workload.from)
                    schedTo = parseISO(workload.to)
                  }

                  const isFirstDay = isSameDay(day, schedFrom)
                  const isLastDay = isSameDay(day, schedTo)

                  return (
                    <div
                      key={workload.id}
                      className="text-xs p-1 rounded bg-muted/50 cursor-pointer hover:bg-muted truncate"
                      onClick={(e) => {
                        e.stopPropagation() // Prevent triggering the day click
                        onSelectWorkload(workload)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{workload.title}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1 py-0 h-4",
                            workload.type === "FACULTY"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
                          )}
                        >
                          {workload.type === "FACULTY" ? "Class" : "Admin"}
                        </Badge>
                      </div>

                      {isMultiDay && (
                        <div className="flex items-center text-[10px] text-muted-foreground mt-0.5">
                          <CalendarRange className="h-2.5 w-2.5 mr-0.5" />
                          {isFirstDay ? "Starts" : isLastDay ? "Ends" : "Ongoing"}
                        </div>
                      )}
                    </div>
                  )
                })}

                {hasMoreWorkloads && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-6 text-xs"
                    onClick={(e) => toggleDayExpanded(dayStr, e)}
                  >
                    {isExpanded ? (
                      <span className="flex items-center">
                        Show less <ChevronUp className="h-3 w-3 ml-1" />
                      </span>
                    ) : (
                      <span className="flex items-center">
                        +{dayWorkloads.length - initialWorkloadsToShow} more <ChevronDown className="h-3 w-3 ml-1" />
                      </span>
                    )}
                  </Button>
                )}

                {dayHasWorkloads === false && <div className="text-xs text-muted-foreground p-1">No workloads</div>}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
