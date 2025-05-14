"use client"

import * as React from "react"
import { format, addYears, subYears } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface MonthPickerProps {
  value?: Date
  onChange?: (date: Date) => void
  className?: string
}

export function MonthPicker({ value, onChange, className }: MonthPickerProps) {
  const [date, setDate] = React.useState<Date>(value || new Date())
  const [open, setOpen] = React.useState(false)

  // Month names
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const handlePreviousYear = () => {
    setDate(subYears(date, 1))
  }

  const handleNextYear = () => {
    setDate(addYears(date, 1))
  }

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(date)
    newDate.setMonth(monthIndex)
    setDate(newDate)
    onChange?.(newDate)
    setOpen(false)
  }

  React.useEffect(() => {
    if (value) {
      setDate(value)
    }
  }, [value])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "MMMM yyyy") : <span>Pick a month</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="p-2 border-b">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={handlePreviousYear} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-lg font-semibold">{date.getFullYear()}</div>
              <Button variant="outline" size="icon" onClick={handleNextYear} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 p-3">
            {months.map((month, index) => {
              const isSelected = date.getMonth() === index
              return (
                <Button
                  key={month}
                  variant={isSelected ? "default" : "ghost"}
                  className={cn(
                    "h-10 text-center",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  )}
                  onClick={() => handleMonthSelect(index)}
                >
                  {month}
                </Button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
