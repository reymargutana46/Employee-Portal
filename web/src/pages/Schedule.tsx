import { Suspense, useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ScheduleView } from "@/components/ScheduleView";
import { useWorkloadStore } from "@/store/useWorkloadstore";

export default function MySchedulePage() {
  const { mySchedule, fetchMySchedule } = useWorkloadStore();
  useEffect(() => {
    fetchMySchedule();
    console.log(mySchedule)
  }, []);
  return (
    <div className="container py-6 space-y-6">
      <Suspense fallback={<ScheduleSkeleton />}>
        <ScheduleView workloads={mySchedule}/>
      </Suspense>
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
  );
}
