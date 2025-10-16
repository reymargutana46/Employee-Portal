"use client";

import type React from "react";
import { useState } from "react";
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  startOfMonth,
  endOfMonth,
  getDay,
  isSameMonth
} from "date-fns";
import { cn } from "@/lib/utils";
import type { Workload } from "@/types/workload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, List, CalendarDays } from "lucide-react";
import { WorkloadItem } from "./WorkloadItem";
import { WorkloadDetails } from "./WorkloadDetails";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PrincipalScheduleViewProps {
  workloads: Workload[];
}

export function PrincipalScheduleView({ workloads }: PrincipalScheduleViewProps): React.ReactElement {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [selectedWorkload, setSelectedWorkload] = useState<Workload | null>(null);

  const handlePrevious = (): void => {
    const newDate = new Date(selectedDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setSelectedDate(newDate);
  };

  const handleNext = (): void => {
    const newDate = new Date(selectedDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const handleToday = (): void => {
    setSelectedDate(new Date());
  };

  const handleViewChange = (newView: "day" | "week" | "month") => {
    setView(newView);
  };

  const getWorkloadsForDay = (day: Date): Workload[] => {
    return workloads.filter((workload) => {
      // Get the correct schedule dates based on workload type
      let schedFrom: Date;
      let schedTo: Date;

      if (workload.type === "FACULTY" && workload.faculty_w_l) {
        schedFrom = parseISO(workload.faculty_w_l.sched_from);
        schedTo = parseISO(workload.faculty_w_l.sched_to);
      } else if (workload.type === "STAFF" && workload.staff_w_l) {
        schedFrom = parseISO(workload.staff_w_l.sched_from);
        schedTo = parseISO(workload.staff_w_l.sched_to);
      } else {
        // Fallback to workload from/to if no specific schedule
        schedFrom = parseISO(workload.from);
        schedTo = parseISO(workload.to);
      }

      // Set time to start of day for date comparison
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      // Check if the day is within the workload schedule
      return (
        (isSameDay(schedFrom, day) || isBefore(schedFrom, dayStart)) &&
        (isSameDay(schedTo, day) || isAfter(schedTo, dayEnd))
      );
    });
  };

  // Day View Component
  const DayView = ({ date }: { date: Date }) => {
    const dayWorkloads = getWorkloadsForDay(date);
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-bold">{format(date, "EEEE, MMMM d, yyyy")}</h3>
        </div>
        
        {dayWorkloads.length > 0 ? (
          <div className="grid gap-3">
            {dayWorkloads.map((workload) => (
              <Card 
                key={workload.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedWorkload(workload)}
              >
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{workload.title}</CardTitle>
                    <Badge 
                      variant={workload.type === "FACULTY" ? "default" : "secondary"}
                      className="ml-2"
                    >
                      {workload.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {workload.type === "FACULTY" && workload.faculty_w_l && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Subject: {workload.faculty_w_l.subject}
                      </p>
                      <p className="text-sm">
                        Time: {format(parseISO(workload.faculty_w_l.sched_from), "h:mm a")} -{" "}
                        {format(parseISO(workload.faculty_w_l.sched_to), "h:mm a")}
                      </p>
                      <p className="text-sm">
                        Room: {workload.faculty_w_l.room?.name || "Not assigned"}
                      </p>
                    </div>
                  )}
                  
                  {workload.type === "STAFF" && workload.staff_w_l && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Task: {workload.staff_w_l.title}
                      </p>
                      <p className="text-sm">
                        Time: {format(parseISO(workload.staff_w_l.sched_from), "h:mm a")} -{" "}
                        {format(parseISO(workload.staff_w_l.sched_to), "h:mm a")}
                      </p>
                      <p className="text-sm">
                        Description: {workload.staff_w_l.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No workloads scheduled for this day</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Week View Component
  const WeekView = ({ date }: { date: Date }) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

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
          {daysOfWeek.map((day) => {
            const dayWorkloads = getWorkloadsForDay(day);
            return (
              <Card
                key={day.toString()}
                className={cn(
                  "min-h-[120px] p-2 relative cursor-pointer hover:bg-muted/50 transition-colors",
                  isToday(day) && "border-primary bg-muted/50"
                )}
                onClick={() => {
                  setSelectedDate(day);
                  setView("day");
                }}
              >
                <div className="text-right">
                  <span
                    className={cn(
                      "text-sm inline-block w-6 h-6 rounded-full text-center leading-6",
                      isToday(day) && "bg-primary text-primary-foreground font-medium"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                <div className="space-y-1 mt-1">
                  {dayWorkloads.slice(0, 3).map((workload) => (
                    <div
                      key={workload.id}
                      className="text-xs p-1 rounded bg-muted/50 truncate"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWorkload(workload);
                      }}
                    >
                      <span className="truncate">{workload.title}</span>
                    </div>
                  ))}

                  {dayWorkloads.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayWorkloads.length - 3}
                    </div>
                  )}

                  {dayWorkloads.length === 0 && (
                    <div className="text-xs text-muted-foreground p-1">-</div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // Month View Component
  const MonthView = ({ date }: { date: Date }) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate days needed to fill the grid from previous and next months
    const startDay = getDay(monthStart);
    const daysFromPreviousMonth = startDay === 0 ? 6 : startDay - 1; // Adjust for Monday start (0 = Sunday)

    const previousMonthDays = Array.from({ length: daysFromPreviousMonth }).map((_, i) =>
      addDays(monthStart, -daysFromPreviousMonth + i)
    );

    // Calculate total days in grid (previous month + current month)
    const totalDaysInGrid = previousMonthDays.length + monthDays.length;

    // Calculate how many days we need from next month to complete the grid (multiple of 7)
    const remainingDays = 7 - (totalDaysInGrid % 7);
    const nextMonthDays =
      remainingDays === 7 ? [] : Array.from({ length: remainingDays }).map((_, i) => addDays(monthEnd, i + 1));

    // Combine all days
    const calendarDays = [...previousMonthDays, ...monthDays, ...nextMonthDays];

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
            const dayWorkloads = getWorkloadsForDay(day);
            const isCurrentMonth = isSameMonth(day, date);
            const isCurrentDay = isSameDay(day, new Date());

            return (
              <Card
                key={day.toString()}
                className={cn(
                  "min-h-[120px] p-2 relative cursor-pointer hover:bg-muted/50 transition-colors",
                  !isCurrentMonth && "opacity-40 bg-muted/30",
                  isCurrentDay && "border-primary bg-muted/50"
                )}
                onClick={() => {
                  setSelectedDate(day);
                  setView("day");
                }}
              >
                <div className="text-right">
                  <span
                    className={cn(
                      "text-sm inline-block w-6 h-6 rounded-full text-center leading-6",
                      isCurrentDay && "bg-primary text-primary-foreground font-medium"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                <div className="space-y-1 mt-1">
                  {dayWorkloads.slice(0, 3).map((workload) => (
                    <div
                      key={workload.id}
                      className="text-xs p-1 rounded bg-muted/50 truncate"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWorkload(workload);
                      }}
                    >
                      <span className="truncate">{workload.title}</span>
                    </div>
                  ))}

                  {dayWorkloads.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayWorkloads.length - 3}
                    </div>
                  )}

                  {dayWorkloads.length === 0 && (
                    <div className="text-xs text-muted-foreground p-1">-</div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* View Controls - Cleaned up with dropdown */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-3 py-2 text-sm font-medium min-w-[120px] text-center">
              {view === "day" && format(selectedDate, "MMMM d, yyyy")}
              {view === "week" && (
                <>
                  {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "MMM d")} -{" "}
                  {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), "MMM d, yyyy")}
                </>
              )}
              {view === "month" && format(selectedDate, "MMMM yyyy")}
            </div>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={view} onValueChange={handleViewChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Month</span>
                </div>
              </SelectItem>
              <SelectItem value="week">
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span>Week</span>
                </div>
              </SelectItem>
              <SelectItem value="day">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>Day</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* View Content */}
      {view === "day" && <DayView date={selectedDate} />}
      {view === "week" && <WeekView date={selectedDate} />}
      {view === "month" && <MonthView date={selectedDate} />}

      {/* Workload Details Modal */}
      {selectedWorkload && (
        <WorkloadDetails workload={selectedWorkload} onClose={() => setSelectedWorkload(null)} />
      )}
    </div>
  );
}