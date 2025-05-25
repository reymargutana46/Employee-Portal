
import type React from "react"
import { Calendar, ChevronLeft, ChevronRight, List, CalendarIcon, Clock, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, addMonths, subMonths } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { MonthPicker } from "./MonthPicker"

export type ViewType = "week" | "month"
export type FilterOptions = {
  facultyWorkloads: boolean
  staffWorkloads: boolean
}

interface ScheduleHeaderProps {
  date: Date
  view: ViewType
  filters: FilterOptions
  onDateChange: (date: Date) => void
  onViewChange: (view: ViewType) => void
  onFiltersChange: (filters: FilterOptions) => void
}

export function ScheduleHeader({
  date,
  view,
  filters,
  onDateChange,
  onViewChange,
  onFiltersChange,
}: ScheduleHeaderProps): React.ReactElement {
  // Mock data for current employee - in a real app, this would come from an API or context
  const currentEmployee = {
    fname: "John",
    lname: "Doe",
    position: "Professor",
    department: "Computer Science",
    workhours_am: "8:00-12:00",
    workhours_pm: "13:00-17:00",
  }

  const handlePrevious = (): void => {
    if (view === "week") {
      const newDate = new Date(date)
      newDate.setDate(newDate.getDate() - 7)
      onDateChange(newDate)
    } else {
      onDateChange(subMonths(date, 1))
    }
  }

  const handleNext = (): void => {
    if (view === "week") {
      const newDate = new Date(date)
      newDate.setDate(newDate.getDate() + 7)
      onDateChange(newDate)
    } else {
      onDateChange(addMonths(date, 1))
    }
  }

  const handleFilterChange = (key: keyof FilterOptions, value: boolean) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground">View and manage your upcoming workloads</p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handlePrevious} aria-label="Previous period">
              <ChevronLeft className="h-4 w-4" />
            </Button>

              <MonthPicker value={date} onChange={(date) => date && onDateChange(date)}/>

            <Button variant="outline" size="icon" onClick={handleNext} aria-label="Next period">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Select value={view} onValueChange={(value: string) => onViewChange(value as ViewType)}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">
                <span className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Week
                </span>
              </SelectItem>
              <SelectItem value="month">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Month
                </span>
              </SelectItem>
            </SelectContent>
          </Select>


        </div>
      </div>

      <Card className="bg-muted/40">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium">
                {currentEmployee.fname} {currentEmployee.lname}
              </h2>
              <p className="text-xs text-muted-foreground">
                {currentEmployee.position}, {currentEmployee.department}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                Work Hours: {currentEmployee.workhours_am} AM, {currentEmployee.workhours_pm} PM
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
