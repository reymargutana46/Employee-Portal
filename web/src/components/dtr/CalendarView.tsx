"use client"

import { useState } from "react"
import { format, isWeekend, isSameDay, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, XCircle, Clock, Calendar } from "lucide-react"
import type { DateRange } from "react-day-picker"
import DTRActions from "@/components/DTRAction"
import { DTRList } from "@/types/dtr"
import { useAuthStore } from "@/store/useAuthStore"



interface CalendarViewProps {
  records: DTRList[]
  dateRange: DateRange | undefined
  isAdmin: boolean
  isSecretary: boolean
  onRefresh: () => void
}

const DTRCalendarView = ({ records, dateRange, isAdmin, isSecretary, onRefresh }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedRecords, setSelectedRecords] = useState<DTRList[]>([])
  const { canDoAction} = useAuthStore()
  // Generate days for the calendar
  const days =
    dateRange?.from && dateRange?.to
      ? eachDayOfInterval({ start: dateRange.from, end: dateRange.to })
      : eachDayOfInterval({
          start: startOfMonth(new Date()),
          end: endOfMonth(new Date()),
        })

  // Get status for a specific day
  const getDayStatus = (day: Date) => {
    const dayRecords = records.filter((record) => {
      const recordDate = new Date(record.date)
      return isSameDay(recordDate, day)
    })

    if (dayRecords.length === 0) return null

    // Count statuses
    const statuses = {
      Present: dayRecords.filter((r) => r.status === "Present").length,
      Leave: dayRecords.filter((r) => r.status === "Leave").length,
      // Absent: dayRecords.filter((r) => r.status === "Absent").length,
      // Late: dayRecords.filter((r) => r.status === "Late").length,
    }

    return statuses
  }

  // Handle day click
  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
    const dayRecords = records.filter((record) => {
      const recordDate = new Date(record.date)
      return isSameDay(recordDate, day)
    })
    setSelectedRecords(dayRecords)
  }

  // Get status badge
  const getStatusBadge = (status: string, type?: string) => {
    if (status === "Present") {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" /> Present
        </Badge>
      )
    } else if (status === "Absent") {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="mr-1 h-3 w-3" /> Absent
        </Badge>
      )
    } else if (status === "Late") {
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          <Clock className="mr-1 h-3 w-3" /> Late
        </Badge>
      )
    } else if (status === "Leave" && type) {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
          <Calendar className="mr-1 h-3 w-3" /> {type}
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
        {status}
      </Badge>
    )
  }

  // Calculate undertime
  const calculateUndertime = (
    amArrival: string,
    amDeparture: string,
    pmArrival: string,
    pmDeparture: string,
    requiredHours = 8,
  ): { hours: number; minutes: number } => {
    const to24HrMinutes = (time: string): number => {
      if (!time || time === "-") return 0

      const [timeStr, modifier] = time.trim().split(" ")
      // eslint-disable-next-line prefer-const
      let [hours, minutes] = timeStr.split(":").map(Number)

      if (modifier === "PM" && hours !== 12) hours += 12
      if (modifier === "AM" && hours === 12) hours = 0

      return hours * 60 + minutes
    }

    // Handle missing times
    if (
      !amArrival ||
      !amDeparture ||
      !pmArrival ||
      !pmDeparture ||
      amArrival === "-" ||
      amDeparture === "-" ||
      pmArrival === "-" ||
      pmDeparture === "-"
    ) {
      return { hours: 0, minutes: 0 }
    }

    // Convert times to minutes
    const amArrivalMinutes = to24HrMinutes(amArrival)
    const amDepartureMinutes = to24HrMinutes(amDeparture)
    const pmArrivalMinutes = to24HrMinutes(pmArrival)
    const pmDepartureMinutes = to24HrMinutes(pmDeparture)

    // Calculate worked minutes in the morning and afternoon
    const morningMinutes = amDepartureMinutes - amArrivalMinutes
    const afternoonMinutes = pmDepartureMinutes - pmArrivalMinutes

    // Ensure no negative minutes
    const totalMinutes = Math.max(0, morningMinutes) + Math.max(0, afternoonMinutes)

    // Expected minutes based on required hours
    const expectedMinutes = requiredHours * 60

    // Calculate undertime in minutes
    const undertimeMinutes = Math.max(0, expectedMinutes - totalMinutes)

    // Return undertime in hours and minutes
    return {
      hours: Math.floor(undertimeMinutes / 60),
      minutes: undertimeMinutes % 60,
    }
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Add empty cells for days before the first day of the month */}
        {dateRange?.from &&
          Array.from({ length: dateRange.from.getDay() }).map((_, index) => (
            <div key={`empty-start-${index}`} className="h-24 p-1" />
          ))}

        {/* Render actual days */}
        {days.map((day, i) => {
          const dayStatus = getDayStatus(day)
          const isWeekendDay = isWeekend(day)

          return (
            <Button
              key={i}
              variant="outline"
              className={`h-24 p-1 flex flex-col items-start justify-start ${isWeekendDay ? "bg-gray-50" : ""}`}
              onClick={() => handleDayClick(day)}
            >
              <span className={`text-sm font-medium ${isWeekendDay ? "text-gray-400" : ""}`}>{format(day, "d")}</span>

              {dayStatus && (
                <div className="mt-1 w-full">
                  {dayStatus.Present > 0 && (
                    <div className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded mb-0.5 truncate">
                      {dayStatus.Present} Present
                    </div>
                  )}
                  {dayStatus.Leave > 0 && (
                    <div className="text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded mb-0.5 truncate">
                      {dayStatus.Leave} Leave
                    </div>
                  )}
                  {/* {dayStatus.Absent > 0 && (
                    <div className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded mb-0.5 truncate">
                      {dayStatus.Absent} Absent
                    </div>
                  )}
                  {dayStatus.Late > 0 && (
                    <div className="text-xs bg-amber-100 text-amber-800 px-1 py-0.5 rounded mb-0.5 truncate">
                      {dayStatus.Late} Late
                    </div>
                  )} */}
                </div>
              )}
            </Button>
          )
        })}

        {/* Add empty cells for days after the last day of the month to complete the grid */}
        {dateRange?.to &&
          Array.from({ length: 6 - dateRange.to.getDay() }).map((_, index) => (
            <div key={`empty-end-${index}`} className="h-24 p-1" />
          ))}
      </div>

      {/* Day Detail Dialog */}
      <Dialog open={selectedDate !== null} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""}</DialogTitle>
          </DialogHeader>

          {selectedRecords.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No records found for this date.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {selectedRecords.map((record, index) => {
                const { hours, minutes } = calculateUndertime(
                  record.am_arrival,
                  record.am_departure,
                  record.pm_arrival,
                  record.pm_departure,
                )

                return (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{record.employee}</h3>
                      </div>
                      {getStatusBadge(record.status, record.type)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">AM Time</p>
                        <p className="text-sm">
                          {record.am_arrival !== "-" ? (
                            <>
                              {record.am_arrival} - {record.am_departure}
                            </>
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">PM Time</p>
                        <p className="text-sm">
                          {record.pm_arrival !== "-" ? (
                            <>
                              {record.pm_arrival} - {record.pm_departure}
                            </>
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Undertime</p>
                        <p className="text-sm">
                          {hours}:{minutes < 10 ? `0${minutes}` : minutes}
                        </p>
                      </div>

                      {(isSecretary || isAdmin) && record.status === "Present" && (
                        <DTRActions
                          record={record}
                          onUpdate={() => {
                            onRefresh()
                            // Refresh the selected records
                            if (selectedDate) {
                              const updatedRecords = records.filter((r) => {
                                const recordDate = new Date(r.date)
                                return isSameDay(recordDate, selectedDate)
                              })
                              setSelectedRecords(updatedRecords)
                            }
                          }}
                        />
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DTRCalendarView
