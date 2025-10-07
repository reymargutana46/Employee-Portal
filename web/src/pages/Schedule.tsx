import { Suspense, useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ScheduleView } from "@/components/ScheduleView";
import { useWorkloadStore } from "@/store/useWorkloadstore";
import { useClassScheduleStore } from "@/store/useClassScheduleStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import axios from "@/utils/axiosInstance";
import type { Workload } from "@/types/workload";
import type { Res } from "@/types/response";

export default function MySchedulePage() {
  const { mySchedule, fetchMySchedule } = useWorkloadStore();
  const { myCreatedSchedules, fetchMyCreatedSchedules } = useClassScheduleStore();
  const { canDoAction } = useAuthStore();
  const [myCreated, setMyCreated] = useState<Workload[]>([]);
  
  useEffect(() => {
    fetchMySchedule();
    fetchMyCreatedSchedules();
    
    // Fetch workload schedules if user is gradeleader
    if (canDoAction(['gradeleader'])) {
      axios.get<Res<Workload[]>>("/workload/my-created").then((response) => {
        setMyCreated(response.data.data || []);
      }).catch(() => {});
    }
  }, [fetchMySchedule, fetchMyCreatedSchedules, canDoAction]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }
  return (
    <div className="container py-6 space-y-6">
      <Suspense fallback={<ScheduleSkeleton />}>
        <ScheduleView workloads={mySchedule}/>
      </Suspense>
      
      {/* Class Schedules Section (only for grade leaders) */}
      {canDoAction(['gradeleader']) && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">My Created Class Schedules</h2>
          <div className="grid gap-4">
            {myCreatedSchedules.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    No class schedules created yet. Use the "Create Schedule" button to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              myCreatedSchedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{schedule.grade_section}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {schedule.school_year} • {schedule.adviser_teacher}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {schedule.total_learners} learners ({schedule.male_learners} male, {schedule.female_learners} female)
                        </p>
                      </div>
                      <Badge className={getStatusColor(schedule.status)}>
                        {schedule.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(schedule.created_at).toLocaleDateString()}
                      {schedule.approval_remarks && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <strong>Remarks:</strong> {schedule.approval_remarks}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Workload Schedules Section */}
      {canDoAction(['gradeleader']) && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">My Created Workload Schedules</h2>
          <div className="grid gap-2">
            {myCreated.length === 0 ? (
              <p className="text-sm text-muted-foreground">No workload schedules created</p>
            ) : (
              myCreated.map((w) => (
                <div key={w.id} className="border rounded p-2 text-sm">
                  <div className="flex justify-between">
                    <span>{w.title}</span>
                    <Badge className={getStatusColor(w.status || 'PENDING')}>
                      {w.status || 'PENDING'}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground">{w.from} - {w.to}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ScheduleSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-12 w-full" />
      <div className="grid gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );}
