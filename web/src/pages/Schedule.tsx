import { useEffect, useState } from "react";

import { useWorkloadStore } from "@/store/useWorkloadstore";
import { useClassScheduleStore } from "@/store/useClassScheduleStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { ScheduleDetailView } from "@/components/ScheduleDetailView";
import { PrincipalScheduleView } from "@/components/PrincipalScheduleView";
import axios from "@/utils/axiosInstance";
import type { Workload } from "@/types/workload";
import type { Res } from "@/types/response";
import type { ClassSchedule } from "@/types/classSchedule";
import { Eye } from "lucide-react";
import { format } from "date-fns";

export default function MySchedulePage() {
  const { 
    facultyWorkloads, 
    staffWorkloads, 
    fetchWorkloads,
    fetchMySchedule 
  } = useWorkloadStore();
  const { 
    schedules, 
    myCreatedSchedules, 
    fetchMyCreatedSchedules, 
    fetchSchedules 
  } = useClassScheduleStore();
  const { canDoAction, user } = useAuthStore();
  const [myCreated, setMyCreated] = useState<Workload[]>([]);
  const [myAssignedSchedules, setMyAssignedSchedules] = useState<ClassSchedule[]>([]);
  const approvedAssignedSchedules = myAssignedSchedules.filter((s) => s.status === 'APPROVED');
  const approvedSchedules = schedules.filter((s) => s.status === 'APPROVED');
  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  
  useEffect(() => {
    console.log('Schedule page useEffect - user canDoAction:', {
      faculty: canDoAction(['faculty']),
      gradeleader: canDoAction(['gradeleader']),
      principal: canDoAction(['principal']),
      userRoles: user?.roles
    });
    
    // For principals, fetch all workloads; for others, fetch their assigned schedule
    if (canDoAction(['principal'])) {
      fetchWorkloads(); // Fetch all workloads for principals
    } else {
      fetchMySchedule(); // Fetch assigned schedule for faculty/staff
    }
    
    // Fetch workload schedules if user is gradeleader
    if (canDoAction(['gradeleader'])) {
      fetchMyCreatedSchedules();
    }
    
    // Fetch workload schedules if user is gradeleader
    if (canDoAction(['gradeleader'])) {
      axios.get<Res<Workload[]>>("/workload/my-created").then((response) => {
        setMyCreated(response.data.data || []);
      }).catch(() => {});
    }

    // Fetch assigned schedules for faculty/teachers and grade leaders
    if (canDoAction(['faculty']) || canDoAction(['gradeleader'])) {
      console.log('Fetching assigned schedules for user');
      axios.get<Res<ClassSchedule[]>>("/class-schedules/my-assigned")
        .then((response) => {
          console.log('API response for my-assigned:', response.data);
          setMyAssignedSchedules(response.data.data || []);
        })
        .catch((error) => {
          console.error('Error fetching assigned schedules:', error.response?.data || error.message);
        });
    }
    
    // Fetch all schedules for principal
    if (canDoAction(['principal'])) {
      fetchSchedules();
    }
  }, [fetchMySchedule, fetchWorkloads, fetchMyCreatedSchedules, canDoAction, fetchSchedules]);
  
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (e) {
      return dateString
    }
  }

  const handleViewSchedule = (schedule: ClassSchedule) => {
    setSelectedSchedule(schedule);
    setIsDetailViewOpen(true);
  }
  
  // Combine faculty and staff workloads for principals
  const allWorkloads = [...facultyWorkloads, ...staffWorkloads];
  
  return (
    <div className="container py-6 space-y-6">
      {/* Header - show title only */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground">View your assigned class schedules</p>
        </div>
      </div>
      
      {/* Assigned Class Schedules Section (for faculty/teachers and grade leaders) */}
      {(canDoAction(['faculty']) || canDoAction(['gradeleader'])) && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">My Assigned Class Schedules</h2>
          <div className="grid gap-4">
            {approvedAssignedSchedules.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    No approved class schedules assigned to you yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              approvedAssignedSchedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {schedule.grade_section}
                          {schedule.status === 'APPROVED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewSchedule(schedule)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View & Download
                            </Button>
                          )}
                        </CardTitle>
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
                      Approved: {schedule.approved_at ? formatDate(schedule.approved_at) : 'N/A'}
                      {schedule.approval_remarks && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-xs">
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

      {/* Principal view - show calendar-based schedule with day/week/month views */}
      {canDoAction(['principal']) && (
        <PrincipalScheduleView workloads={allWorkloads || []} />
      )}

      {selectedSchedule && (
        <ScheduleDetailView
          schedule={selectedSchedule}
          open={isDetailViewOpen}
          onOpenChange={setIsDetailViewOpen}
        />
      )}
    </div>
  );
}