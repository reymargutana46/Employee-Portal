import { useEffect, useState } from "react";

import { useWorkloadStore } from "@/store/useWorkloadstore";
import { useClassScheduleStore } from "@/store/useClassScheduleStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { ScheduleDetailView } from "@/components/ScheduleDetailView";
import { ScheduleCreator } from "@/components/ScheduleCreator";
import axios from "@/utils/axiosInstance";
import type { Workload } from "@/types/workload";
import type { Res } from "@/types/response";
import type { ClassSchedule } from "@/types/classSchedule";
import { Eye } from "lucide-react";

export default function MySchedulePage() {
  const { mySchedule, fetchMySchedule } = useWorkloadStore();
  const { myCreatedSchedules, fetchMyCreatedSchedules } = useClassScheduleStore();
  const { canDoAction, user } = useAuthStore();
  const [myCreated, setMyCreated] = useState<Workload[]>([]);
  const [myAssignedSchedules, setMyAssignedSchedules] = useState<ClassSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  
  useEffect(() => {
    console.log('Schedule page useEffect - user canDoAction:', {
      faculty: canDoAction(['faculty']),
      gradeleader: canDoAction(['gradeleader']),
      userRoles: user?.roles
    });
    
    fetchMySchedule();
    fetchMyCreatedSchedules();
    
    // Fetch workload schedules if user is gradeleader
    if (canDoAction(['gradeleader'])) {
      axios.get<Res<Workload[]>>("/workload/my-created").then((response) => {
        setMyCreated(response.data.data || []);
      }).catch(() => {});
    }

    // Fetch assigned schedules for faculty/teachers
    if (canDoAction(['faculty'])) {
      console.log('Fetching assigned schedules for faculty user');
      axios.get<Res<ClassSchedule[]>>("/class-schedules/my-assigned")
        .then((response) => {
          console.log('API response for my-assigned:', response.data);
          setMyAssignedSchedules(response.data.data || []);
        })
        .catch((error) => {
          console.error('Error fetching assigned schedules:', error.response?.data || error.message);
        });
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

  const handleViewSchedule = (schedule: ClassSchedule) => {
    setSelectedSchedule(schedule);
    setIsDetailViewOpen(true);
  }
  return (
    <div className="container py-6 space-y-6">
      {/* Header with Create Schedule Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground">View and manage your class schedules</p>
        </div>
        <div className="flex items-center gap-2">
          {canDoAction(['gradeleader']) && <ScheduleCreator />}
        </div>
      </div>
      
      {/* Assigned Class Schedules Section (for faculty/teachers) */}
      {canDoAction(['faculty']) && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">My Assigned Class Schedules</h2>
          <div className="grid gap-4">
            {myAssignedSchedules.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    No approved class schedules assigned to you yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              myAssignedSchedules.map((schedule) => (
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
                      Approved: {schedule.approved_at ? new Date(schedule.approved_at).toLocaleDateString() : 'N/A'}
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
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {schedule.grade_section}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSchedule(schedule)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {schedule.status === 'APPROVED' ? 'View & Download' : 'View Schedule'}
                          </Button>
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


