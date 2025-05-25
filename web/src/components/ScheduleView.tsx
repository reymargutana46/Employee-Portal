"use client";

import type React from "react";

import { cn } from "@/lib/utils";

import { useState, useEffect, useMemo } from "react";
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
  addMonths,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Workload } from "@/types/workload";
import { useLocation, useNavigate } from "react-router-dom";
import { MonthView } from "./MonthlyView";
import { ViewType, FilterOptions, ScheduleHeader } from "./ScheduleHeader";
import { WorkloadDetails } from "./WorkloadDetails";
import { WorkloadItem } from "./WorkloadItem";
import { DayDetailView } from "./DayDetailedView";

interface ScheduleViewProps {
  workloads: Workload[];
}

export function ScheduleView({
  workloads,
}: ScheduleViewProps): React.ReactElement {
  const navigate = useNavigate();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const viewParam = searchParams.get("view") || "week";
  const dateParam = searchParams.get("date") || new Date().toISOString();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(parseISO(dateParam));
  const [view, setView] = useState<ViewType>(
    viewParam === "month" ? "month" : "week"
  );

  const [selectedWorkload, setSelectedWorkload] = useState<Workload | null>(
    null
  );
  const [filters, setFilters] = useState<FilterOptions>({
    facultyWorkloads: true,
    staffWorkloads: true,
  });

  // Update URL when view or date changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("view", view);
    params.set("date", selectedDate.toISOString());
    navigate(`?${params.toString()}`);
  }, [view, selectedDate, navigate, searchParams]);

  const filteredWorkloads = workloads.filter((workload) => {
    if (workload.type === "FACULTY" && !filters.facultyWorkloads) return false;
    if (workload.type === "STAFF" && !filters.staffWorkloads) return false;
    return true;
  });

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleViewChange = (newView: ViewType) => {
    setView(newView);
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };
 const handleDayClick = (day: Date) => {
    setSelectedDay(day)
  }
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Updated function to check if a workload is active on a specific day
  const getWorkloadsForDay = (day: Date): Workload[] => {
    return filteredWorkloads.filter((workload) => {
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

  return (
    <div className="space-y-6">
      <ScheduleHeader
        date={selectedDate}
        view={view}
        filters={filters}
        onDateChange={handleDateChange}
        onViewChange={handleViewChange}
        onFiltersChange={handleFiltersChange}
      />

       {view === "week" ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {daysOfWeek.map((day) => {
            const dayWorkloads = getWorkloadsForDay(day)
            return (
              <Card
                key={day.toString()}
                className={cn(
                  "h-full min-h-[150px] cursor-pointer hover:bg-muted/50 transition-colors",
                  isToday(day) && "border-primary",
                )}
                onClick={() => handleDayClick(day)}
              >
                <CardHeader className="p-3">
                  <CardTitle className="text-sm font-medium">
                    {format(day, "EEE")}
                    <span className="ml-1 text-muted-foreground">{format(day, "d")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {dayWorkloads.length > 0 ? (
                    <div className="space-y-2">
                      {dayWorkloads.slice(0, 3).map((workload) => (
                        <WorkloadItem
                          key={workload.id}
                          workload={workload}
                          day={day}
                          onClick={(e) => {
                            e.stopPropagation() // Prevent triggering the card click
                            setSelectedWorkload(workload)
                          }}
                        />
                      ))}
                      {dayWorkloads.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center pt-1">
                          +{dayWorkloads.length - 3} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No workloads</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <MonthView
          date={selectedDate}
          workloads={filteredWorkloads}
          onSelectWorkload={setSelectedWorkload}
          onSelectDate={handleDayClick}
        />
      )}

      {selectedWorkload && <WorkloadDetails workload={selectedWorkload} onClose={() => setSelectedWorkload(null)} />}

      {selectedDay && (
        <DayDetailView
          date={selectedDay}
          workloads={getWorkloadsForDay(selectedDay)}
          onSelectWorkload={setSelectedWorkload}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
