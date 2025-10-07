import type React from "react"

import { parseISO, format, differenceInDays } from "date-fns"
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
import { Calendar, Clock, MapPin, User, Phone, Mail, CalendarRange } from "lucide-react"
import UserWithAvatar from "@/components/ui/user-with-avatar";

interface WorkloadDetailsProps {
  workload: Workload
  onClose: () => void
}

export function WorkloadDetails({ workload, onClose }: WorkloadDetailsProps): React.ReactElement {
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

  const isMultiDay = schedFrom.toDateString() !== schedTo.toDateString()
  const durationDays = isMultiDay ? differenceInDays(schedTo, schedFrom) + 1 : 0
  const { employee } = workload

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{workload.title}</span>
            <Badge>{workload.type === "FACULTY" ? "Class" : "Admin"}</Badge>
          </DialogTitle>
          <DialogDescription>Workload details and information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            {isMultiDay ? (
              <>
                <CalendarRange className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Date Range ({durationDays} days)</p>
                  <p className="text-sm text-muted-foreground">
                    {format(schedFrom, "EEEE, MMMM d, yyyy")} - {format(schedTo, "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">{format(schedFrom, "EEEE, MMMM d, yyyy")}</p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Time</p>
              <p className="text-sm text-muted-foreground">
                {format(schedFrom, "h:mm a")} - {format(schedTo, "h:mm a")}
              </p>
            </div>
          </div>

          {workload.type === "FACULTY" && workload.faculty_w_l && (
            <>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {workload.faculty_w_l.room?.name || "No room assigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Subject</p>
                  <p className="text-sm text-muted-foreground">
                    {workload.faculty_w_l.subject} (Quarter {workload.faculty_w_l.quarter})
                  </p>
                </div>
              </div>
            </>
          )}

          {workload.type === "STAFF" && workload.staff_w_l && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Description</p>
                <p className="text-sm text-muted-foreground">{workload.staff_w_l.description}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Assigned To</p>
              <UserWithAvatar 
                user={employee}
                size="sm"
                showFullName={true}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {employee.position}, {employee.department}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Contact</p>
              <p className="text-sm text-muted-foreground">{employee.email}</p>
              <p className="text-sm text-muted-foreground">
                <Phone className="h-3 w-3 inline mr-1" /> {employee.contactno}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
