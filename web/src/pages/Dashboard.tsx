import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Calendar,
  Clock,
  FileText,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useClassScheduleStore } from "@/store/useClassScheduleStore";
import { useSeerviceRequestStore } from "@/store/useServiceRequestStore";
import { useLeaveStore } from "@/store/useLeaveStore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { RecentActivities } from "@/components/charts/RecentActivities";
import DtrMonthlyChart from "@/components/charts/DtrMonthlyChart";
import { WorkloadChart } from "@/components/charts/WorkloadChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import axios from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Res } from "@/types/response";
import { ServiceRequestChart } from "@/components/ServiceRequestChart";
import { Calendar as UICalendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { ClassSchedule } from "@/types/classSchedule";

export interface DashboardCard {
  totalEmployees: number;
  employeeDiff: number;
  attendanceData: {
    total: number;
    present: number;
    absent: number;
    late: number;
  };
  attendanceRateDiff: number;
  avgWorkload: number;
  avgWorkloadDiff: number;
  leaveRequests: number;
  leaveRequestsDiff: number;
  staffLeaveDetails?: {
    total: number;
    pending: number;
    approved: number;
    disapproved: number;
  };
  facultyByGrade?: {
    admin: number;
    principal: number;
    secretary: number;
    grade1: number;
    grade2: number;
    grade3: number;
    grade4: number;
    grade5: number;
    grade6: number;
    staff: number;
  };
  workloadStats?: {
    total: number;
    approved: number;
    disapproved: number;
  };
  leaveStats?: {
    total: number;
    pending: number;
    approved: number;
    disapproved: number;
  };
}

export interface MonthlyAttendance {
  attendanceData: attendanceData[];
  quarter: number;
}
export interface attendanceData {
  month: string;
  attendance: number;
  fill: string;
}

export interface RecentLog {
  performed_by: string;
  action: string;
  description: string;
  time: string;
}

export interface DashboardData {
  card: DashboardCard;
  monthlyAttendance: MonthlyAttendance;
  recentlogs: RecentLog[];
  workloads: WorkloadData[];
  serviceRequests: ServiceRequestDate[];
}
export interface WorkloadData {
  role: string;
  workload: number;
  fill: string;
}
export interface ServiceRequestDate {
  month: string;
  pending: number;
  inProgress: number;
  completed: number;
  rejected: number;
  forApproval: number;
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyAttendance, setMonthlyAttendance] =
    useState<MonthlyAttendance | null>(null);
  const [card, setCard] = useState<DashboardCard | null>(null);
  const [workload, setWorkload] = useState<WorkloadData[]>([]);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestDate[]>([]);
  const [classSchedules, setClassSchedules] = useState<ClassSchedule[]>([]);
  const [myCreatedSchedules, setMyCreatedSchedules] = useState<ClassSchedule[]>([]);
  const [isSchedulesLoading, setIsSchedulesLoading] = useState(true);
  const [currentQuarter, setCurrentQuarter] = useState(1); // 1 for Jan-Jun, 2 for Jul-Dec
  const [error, setError] = useState<string | null>(null);

  const { userRoles } = useAuth();
  const { user } = useAuth();
  const { user: authUser } = useAuthStore();
  const { personalLeaves } = useLeaveStore();
  const { toast } = useToast();
  const { canDoAction } = useAuthStore();
  const { serviceRequests: storeServiceRequests, fetchRequests } = useSeerviceRequestStore();
  
  // Find the first applicable role for stats display
  const userRole = userRoles.length > 0 ? userRoles[0] : null;

  // Filter service requests based on user role (same logic as ServiceRequests page)
  const userFilteredServiceRequests = useMemo(() => {
    const isPrivilegedUser = canDoAction(["principal", "secretary"]);
    return isPrivilegedUser 
      ? storeServiceRequests 
      : storeServiceRequests.filter(request => 
          request.requestor === user?.username || 
          (user?.employee_id && request.requestToId === String(user?.employee_id))
        );
  }, [storeServiceRequests, canDoAction, user]);

  // Ensure card data has default values if some properties are missing
  const safeCard = useMemo(() => ({
    totalEmployees: card?.totalEmployees || 0,
    employeeDiff: card?.employeeDiff || 0,
    attendanceData: card?.attendanceData || { total: 0, present: 0, absent: 0, late: 0 },
    avgWorkload: card?.avgWorkload || 0,
    avgWorkloadDiff: card?.avgWorkloadDiff || 0,
    leaveRequests: card?.leaveRequests || 0,
    leaveRequestsDiff: card?.leaveRequestsDiff || 0,
    staffLeaveDetails: card?.staffLeaveDetails || { total: 0, pending: 0, approved: 0, disapproved: 0 },
    facultyByGrade: card?.facultyByGrade || { admin: 0, principal: 0, secretary: 0, grade1: 0, grade2: 0, grade3: 0, grade4: 0, grade5: 0, grade6: 0, staff: 0 },
    workloadStats: card?.workloadStats || { total: 0, approved: 0, disapproved: 0 },
    leaveStats: card?.leaveStats || { total: 0, pending: 0, approved: 0, disapproved: 0 },
  }), [card]);

  // Function to fetch dashboard data with quarter parameter
  const fetchDashboardData = useCallback((quarter: number) => {
    setIsLoading(true);
    setError(null);
    
    axios
      .get<Res<DashboardData>>(`/accounts/page/dashboard?quarter=${quarter}`)
      .then((response) => {
        const {
          monthlyAttendance,
          card,
          recentlogs,
          workloads,
          serviceRequests,
        } = response.data.data;
        
        // Log the response for debugging
        console.log("Dashboard data received:", response.data.data);
        console.log("Recent logs received:", recentlogs);
        console.log("Number of recent logs:", recentlogs?.length || 0);
        
        setWorkload(workloads || []);
        setMonthlyAttendance(monthlyAttendance || null);
        setRecentLogs(recentlogs || []);
        setCard(card || null);
        setServiceRequests(serviceRequests || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard data fetch error:", err);
        setError("Failed to load dashboard data. Please try again.");
        setIsLoading(false);
        
        // Set default empty card data to prevent complete dashboard failure
        setCard({
          totalEmployees: 0,
          employeeDiff: 0,
          attendanceData: { total: 0, present: 0, absent: 0, late: 0 },
          avgWorkload: 0,
          avgWorkloadDiff: 0,
          leaveRequests: 0,
          leaveRequestsDiff: 0,
          staffLeaveDetails: { total: 0, pending: 0, approved: 0, disapproved: 0 },
          facultyByGrade: { admin: 0, principal: 0, secretary: 0, grade1: 0, grade2: 0, grade3: 0, grade4: 0, grade5: 0, grade6: 0, staff: 0 },
          workloadStats: { total: 0, approved: 0, disapproved: 0 },
          leaveStats: { total: 0, pending: 0, approved: 0, disapproved: 0 },
        });
        
        // Show toast notification for better user feedback
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      });
  }, [toast]);

  // Add effect to listen for leave status changes
  useEffect(() => {
    const handleLeaveStatusChange = () => {
      // Refresh dashboard data when leave status changes
      fetchDashboardData(currentQuarter);
    };

    // Add event listener
    window.addEventListener('leaveStatusChanged', handleLeaveStatusChange);

    // Cleanup event listener
    return () => {
      window.removeEventListener('leaveStatusChanged', handleLeaveStatusChange);
    };
  }, [fetchDashboardData, currentQuarter]);

  useEffect(() => {
    fetchDashboardData(currentQuarter);
  }, [currentQuarter, fetchDashboardData]);

  // Fetch service requests for accurate counting
  useEffect(() => {
    if (storeServiceRequests.length <= 0) {
      fetchRequests();
    }
  }, [storeServiceRequests.length, fetchRequests]);

  // Get schedules directly from the store
  const { schedules, fetchSchedules, fetchMyCreatedSchedules } = useClassScheduleStore();

  // Filter approved schedules for display when schedules change
  useEffect(() => {
    if (userRole && userRole.name.toLowerCase() === 'principal') {
      // Filter for approved schedules only for display
      const approvedSchedules = schedules.filter(schedule => schedule.status === 'APPROVED');
      setClassSchedules(approvedSchedules);
    }
  }, [schedules, userRole]);

  // Fetch class schedules for principal and my created schedules for gradeleader
  const fetchClassSchedules = useCallback(async () => {
    if (userRole && userRole.name.toLowerCase() === 'principal') {
      setIsSchedulesLoading(true);
      try {
        await fetchSchedules();
      } catch (error) {
        console.error('Failed to fetch class schedules:', error);
        toast({
          title: "Error",
          description: "Failed to load class schedules.",
          variant: "destructive",
        });
      } finally {
        setIsSchedulesLoading(false);
      }
    } else if (userRole && userRole.name.toLowerCase() === 'gradeleader') {
      setIsSchedulesLoading(true);
      try {
        await fetchMyCreatedSchedules();
        setMyCreatedSchedules(schedules);
      } catch (error) {
        console.error('Failed to fetch my created schedules:', error);
        toast({
          title: "Error",
          description: "Failed to load my created schedules.",
          variant: "destructive",
        });
      } finally {
        setIsSchedulesLoading(false);
      }
    }
  }, [userRole, toast, fetchSchedules, fetchMyCreatedSchedules]);

  useEffect(() => {
    fetchClassSchedules();
  }, [fetchClassSchedules]);

  // Demo stats for different roles
  const stats = useMemo(() => ({
    admin: [
      {
        title: "Total Employees",
        value: 156,
        icon: Users,
        change: "+3%",
        color: "bg-blue-500",
      },
      {
        title: "Pending Leave Requests",
        value: 8,
        icon: Calendar,
        change: "-2%",
        color: "bg-amber-500",
      },
      {
        title: "DTR Exceptions",
        value: 12,
        icon: Clock,
        change: "+5%",
        color: "bg-red-500",
      },
      {
        title: "My Service Requests",
        value: userFilteredServiceRequests.length,
        icon: FileText,
        change: "",
        color: "bg-emerald-500",
      },
    ],
    principal: [
      {
        title: "Faculty Members",
        value: 48,
        icon: Users,
        change: "+1%",
        color: "bg-blue-500",
      },
      {
        title: "Staff Members",
        value: 32,
        icon: Users,
        change: "0%",
        color: "bg-purple-500",
      },
      {
        title: "Pending Approvals",
        value: 15,
        icon: CheckSquare,
        change: "+7%",
        color: "bg-amber-500",
      },
      {
        title: "Upcoming Events",
        value: 3,
        icon: Calendar,
        change: "",
        color: "bg-emerald-500",
      },
    ],
    faculty: [
      {
        title: "My Classes",
        value: 5,
        icon: Users,
        change: "",
        color: "bg-blue-500",
      },
      {
        title: "Total Leave Requests",
        value: safeCard.staffLeaveDetails?.total || 0,
        icon: Calendar,
        change: "",
        color: "bg-emerald-500",
      },
      {
        title: "Pending Requests",
        value: safeCard.staffLeaveDetails?.pending || 0,
        icon: Clock,
        change: "",
        color: "bg-amber-500",
      },
      {
        title: "Approved Requests",
        value: safeCard.staffLeaveDetails?.approved || 0,
        icon: CheckSquare,
        change: "",
        color: "bg-blue-500",
      },
      {
        title: "Disapproved Requests",
        value: safeCard.staffLeaveDetails?.disapproved || 0,
        icon: AlertTriangle,
        change: "",
        color: "bg-red-500",
      },
    ],
    gradeleader: [
      {
        title: "My Grade Classes",
        value: 8,
        icon: Users,
        change: "+1",
        color: "bg-blue-500",
      },
      {
        title: "Active Schedules",
        value: 5,
        icon: Calendar,
        change: "",
        color: "bg-emerald-500",
      },
      {
        title: "Workload Created",
        value: workload?.find(w => w.role === 'Total')?.workload || 
               workload?.reduce((sum, item) => sum + item.workload, 0) || 0,
        icon: CheckSquare,
        change: "",
        color: "bg-purple-500",
      },
      {
        title: "Pending Approvals",
        value: 3,
        icon: Clock,
        change: "-1",
        color: "bg-amber-500",
      },
    ],
    staff: [
      {
        title: "Total Leave Requests",
        value: safeCard.staffLeaveDetails?.total || 0,
        icon: Calendar,
        change: "",
        color: "bg-emerald-500",
      },
      {
        title: "Pending Requests",
        value: safeCard.staffLeaveDetails?.pending || 0,
        icon: Clock,
        change: "",
        color: "bg-amber-500",
      },
      {
        title: "Approved Requests",
        value: safeCard.staffLeaveDetails?.approved || 0,
        icon: CheckSquare,
        change: "",
        color: "bg-blue-500",
      },
      {
        title: "Disapproved Requests",
        value: safeCard.staffLeaveDetails?.disapproved || 0,
        icon: AlertTriangle,
        change: "",
        color: "bg-red-500",
      },
    ],
    secretary: [
      {
        title: "Total Employees",
        value: safeCard.totalEmployees || 0,
        icon: Users,
        change: "",
        color: "bg-blue-500",
      },
      {
        title: "Attendance",
        value: safeCard.attendanceData?.total || 0,
        icon: Calendar,
        change: "",
        color: "bg-emerald-500",
      },
      {
        title: "Service Requests",
        value: serviceRequests?.reduce(
          (sum, month) => 
            sum + month.pending + month.inProgress + month.completed + month.rejected + month.forApproval,
          0
        ) || 0,
        icon: FileText,
        change: "",
        color: "bg-yellow-500",
      },
      {
        title: "Leave Requests",
        value: safeCard.leaveStats?.total || 0,
        icon: AlertTriangle,
        change: "",
        color: "bg-red-500",
      },
    ],
  }), [safeCard, userFilteredServiceRequests, Users, Calendar, Clock, FileText, CheckSquare, AlertTriangle]);

  // Get the appropriate stats for the current user role
  const currentRoleStats = useMemo(() => userRole ? stats[userRole.name] : [], [userRole, stats]);

  const topPerformers = [
    {
      name: "Jennifer Adams",
      department: "Faculty",
      performance: 98,
      image: "/placeholder.svg?height=40&width=40",
      initials: "JA",
    },
    {
      name: "Michael Torres",
      department: "Faculty",
      performance: 96,
      image: "/placeholder.svg?height=40&width=40",
      initials: "MT",
    },
    {
      name: "Sarah Johnson",
      department: "Admin",
      performance: 95,
      image: "/placeholder.svg?height=40&width=40",
      initials: "SJ",
    },
    {
      name: "David Chen",
      department: "Support",
      performance: 94,
      image: "/placeholder.svg?height=40&width=40",
      initials: "DC",
    },
    {
      name: "Emily Rodriguez",
      department: "Faculty",
      performance: 93,
      image: "/placeholder.svg?height=40&width=40",
      initials: "ER",
    },
  ];

  // Announcements demo data
  const overloadedEmployees = [
    {
      name: "Dr. James Wilson",
      department: "Science",
      role: "Professor",
      workload: 42,
      threshold: 35,
    },
    {
      name: "Dr. Patricia Moore",
      department: "Medicine",
      role: "Associate Professor",
      workload: 40,
      threshold: 35,
    },
    {
      name: "Robert Davis",
      department: "IT",
      role: "System Administrator",
      workload: 45,
      threshold: 40,
    },
    {
      name: "Susan Martinez",
      department: "Admin",
      role: "Department Coordinator",
      workload: 43,
      threshold: 40,
    },
    {
      name: "Dr. Thomas Lee",
      department: "Engineering",
      role: "Professor",
      workload: 41,
      threshold: 35,
    },
  ];

  function formatDiff(diff: number): string {
    if (diff > 0) return `+${diff}`;
    if (diff < 0) return `${diff}`; // negative already has '-'
    return "0";
  }

  // Simple calendar component for the dashboard
  const SimpleCalendar = () => {
    // Generate days for October 2025
    const year = 2025;
    const month = 9; // October (0-indexed)
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Create array of days with empty slots for start of week
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    // Highlight October 22
    const highlightedDay = 22;

    return (
      <div className="p-2">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs font-medium py-1 text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`h-8 flex items-center justify-center text-sm rounded-sm ${
                day === highlightedDay
                  ? "bg-primary text-primary-foreground font-medium"
                  : day
                  ? "hover:bg-muted"
                  : ""
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Function to get quarter label
  const getQuarterLabel = (quarter: number) => {
    return quarter === 1 ? "January - June" : "July - December";
  };

  // Function to switch quarters
  const switchQuarter = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentQuarter(currentQuarter === 1 ? 2 : 1);
    } else {
      setCurrentQuarter(currentQuarter === 2 ? 1 : 2);
    }
  };

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg text-red-500 mb-4">{error}</div>
            <Button onClick={() => fetchDashboardData(currentQuarter)}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Don't render the dashboard if card data is not available and we're not loading
  if (!card && !isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg text-red-500 mb-4">
              Failed to load dashboard data
            </div>
            <Button onClick={() => fetchDashboardData(currentQuarter)}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Stats Cards - Modified for staff users */}
      {userRole && userRole.name.toLowerCase() === 'staff' ? (
        // Staff-specific layout with 3 centered cards
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
          {/* Remove Total Employees card for staff */}
          
          {/* Attendance card with detailed information instead of percentage */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Use detailed attendance data */}
              <div className="text-2xl font-bold">{safeCard.attendanceData.total}</div>
              <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                <div className="text-center">
                  <div className="font-medium">{safeCard.attendanceData.present}</div>
                  <div className="text-muted-foreground">Present</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{safeCard.attendanceData.absent}</div>
                  <div className="text-muted-foreground">Absent</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{safeCard.attendanceData.late}</div>
                  <div className="text-muted-foreground">Late</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Service Requests card instead of Workload */}
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {userFilteredServiceRequests.length}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-medium">
                      {userFilteredServiceRequests.filter(r => r.status === "Pending").length}
                    </div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {userFilteredServiceRequests.filter(r => r.status === "In Progress").length}
                    </div>
                    <div className="text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {userFilteredServiceRequests.filter(r => r.status === "Completed").length}
                    </div>
                    <div className="text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {userFilteredServiceRequests.filter(r => r.status === "Disapproved").length}
                    </div>
                    <div className="text-muted-foreground">Disapproved</div>
                  </div>
                  <div className="text-center col-span-2">
                    <div className="font-medium">
                      {userFilteredServiceRequests.filter(r => r.status === "For Approval").length}
                    </div>
                    <div className="text-muted-foreground">For Approval</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Leave Requests card (keep as is) */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Leave Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(userRole && (userRole.name.toLowerCase() === 'staff' || userRole.name.toLowerCase() === 'faculty')) && safeCard.staffLeaveDetails ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{safeCard.staffLeaveDetails.total}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium">{safeCard.staffLeaveDetails.pending}</div>
                      <div className="text-muted-foreground">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{safeCard.staffLeaveDetails.approved}</div>
                      <div className="text-muted-foreground">Approved</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{safeCard.staffLeaveDetails.disapproved}</div>
                      <div className="text-muted-foreground">Disapproved</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold">{safeCard.leaveRequests}</div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : userRole && userRole.name.toLowerCase() === 'faculty' ? (
        // Faculty-specific layout
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Remove Total Employees card for faculty */}
          
          {/* Attendance card with detailed information */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Use detailed attendance data */}
              <div className="text-2xl font-bold">{safeCard.attendanceData.total}</div>
              <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                <div className="text-center">
                  <div className="font-medium">{safeCard.attendanceData.present}</div>
                  <div className="text-muted-foreground">Present</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{safeCard.attendanceData.absent}</div>
                  <div className="text-muted-foreground">Absent</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{safeCard.attendanceData.late}</div>
                  <div className="text-muted-foreground">Late</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Service Requests card instead of Workload */}
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {userFilteredServiceRequests.length}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-medium">
                      {userFilteredServiceRequests.filter(r => r.status === "Pending").length}
                    </div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {userFilteredServiceRequests.filter(r => r.status === "In Progress").length}
                    </div>
                    <div className="text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {userFilteredServiceRequests.filter(r => r.status === "Completed").length}
                    </div>
                    <div className="text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {userFilteredServiceRequests.filter(r => r.status === "Disapproved").length}
                    </div>
                    <div className="text-muted-foreground">Disapproved</div>
                  </div>
                  <div className="text-center col-span-2">
                    <div className="font-medium">
                      {userFilteredServiceRequests.filter(r => r.status === "For Approval").length}
                    </div>
                    <div className="text-muted-foreground">For Approval</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Leave Requests Card with Pending, Approved, Disapproved */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Leave Requests
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeCard.staffLeaveDetails?.total || 0}</div>
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div className="text-center">
                  <div className="font-medium">{safeCard.staffLeaveDetails?.pending || 0}</div>
                  <div className="text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{safeCard.staffLeaveDetails?.approved || 0}</div>
                  <div className="text-muted-foreground">Approved</div>
                </div>
                <div className="text-center col-span-2">
                  <div className="font-medium">{safeCard.staffLeaveDetails?.disapproved || 0}</div>
                  <div className="text-muted-foreground">Disapproved</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : userRole && userRole.name.toLowerCase() === 'principal' ? (
        // Principal-specific layout with detailed information (copied from secretary)
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Total Employees Card with Faculty by Grade Level */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Employees
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeCard.totalEmployees || 0}</div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.admin || 0}</div>
                    <div className="text-muted-foreground">Admin</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.principal || 0}</div>
                    <div className="text-muted-foreground">Principal</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.secretary || 0}</div>
                    <div className="text-muted-foreground">Secretary</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.grade1 || 0}</div>
                    <div className="text-muted-foreground">Grade 1</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.grade2 || 0}</div>
                    <div className="text-muted-foreground">Grade 2</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.grade3 || 0}</div>
                    <div className="text-muted-foreground">Grade 3</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.grade4 || 0}</div>
                    <div className="text-muted-foreground">Grade 4</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.grade5 || 0}</div>
                    <div className="text-muted-foreground">Grade 5</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.grade6 || 0}</div>
                    <div className="text-muted-foreground">Grade 6</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.staff || 0}</div>
                    <div className="text-muted-foreground">Staff</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Card with Present, Absent, Late */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Attendance
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeCard.attendanceData?.total || 0}</div>
                <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                  <div className="text-center">
                    <div className="font-medium">{safeCard.attendanceData?.present || 0}</div>
                    <div className="text-muted-foreground">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.attendanceData?.absent || 0}</div>
                    <div className="text-muted-foreground">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.attendanceData?.late || 0}</div>
                    <div className="text-muted-foreground">Late</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Class Schedules Workload Card for Principal */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Class Schedules</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schedules.length}</div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div className="text-center">
                    <div className="font-medium">
                      {schedules.filter(s => s.status === 'PENDING').length}
                    </div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {schedules.filter(s => s.status === 'APPROVED').length}
                    </div>
                    <div className="text-muted-foreground">Approved</div>
                  </div>
                  <div className="text-center col-span-2">
                    <div className="font-medium">
                      {schedules.filter(s => s.status === 'REJECTED').length}
                    </div>
                    <div className="text-muted-foreground">Rejected</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Requests Card */}
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Service Requests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {serviceRequests?.reduce(
                    (sum, month) => 
                      sum + month.pending + month.inProgress + month.completed + month.rejected + month.forApproval,
                    0
                  ) || 0}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div className="text-center">
                    <div className="font-medium">
                      {serviceRequests?.reduce((sum, month) => sum + month.pending, 0) || 0}
                    </div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {serviceRequests?.reduce((sum, month) => sum + month.inProgress, 0) || 0}
                    </div>
                    <div className="text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {serviceRequests?.reduce((sum, month) => sum + month.completed, 0) || 0}
                    </div>
                    <div className="text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {serviceRequests?.reduce((sum, month) => sum + month.rejected, 0) || 0}
                    </div>
                    <div className="text-muted-foreground">Disapproved</div>
                  </div>
                  <div className="text-center col-span-2">
                    <div className="font-medium">
                      {serviceRequests?.reduce((sum, month) => sum + month.forApproval, 0) || 0}
                    </div>
                    <div className="text-muted-foreground">For Approval</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leave Requests Card with Pending, Approved, Disapproved */}
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Leave Requests
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeCard.leaveStats?.total || 0}</div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div className="text-center">
                    <div className="font-medium">{safeCard.leaveStats?.pending || 0}</div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.leaveStats?.approved || 0}</div>
                    <div className="text-muted-foreground">Approved</div>
                  </div>
                  <div className="text-center col-span-2">
                    <div className="font-medium">{safeCard.leaveStats?.disapproved || 0}</div>
                    <div className="text-muted-foreground">Disapproved</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : userRole && userRole.name.toLowerCase() === 'principal' ? (
        // Principal-specific layout with detailed information (copied from secretary)
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Total Employees Card with Faculty by Grade Level */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Employees
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeCard.totalEmployees || 0}</div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.admin || 0}</div>
                    <div className="text-muted-foreground">Admin</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.principal || 0}</div>
                    <div className="text-muted-foreground">Principal</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.secretary || 0}</div>
                    <div className="text-muted-foreground">Secretary</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.grade1 || 0}</div>
                    <div className="text-muted-foreground">Grade 1</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.grade2 || 0}</div>
                    <div className="text-muted-foreground">Grade 2</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.grade3 || 0}</div>
                    <div className="text-muted-foreground">Grade 3</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.grade4 || 0}</div>
                    <div className="text-muted-foreground">Grade 4</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.grade5 || 0}</div>
                    <div className="text-muted-foreground">Grade 5</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.grade6 || 0}</div>
                    <div className="text-muted-foreground">Grade 6</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.facultyByGrade?.staff || 0}</div>
                    <div className="text-muted-foreground">Staff</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Card with Present, Absent, Late */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Attendance
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeCard.attendanceData?.total || 0}</div>
                <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                  <div className="text-center">
                    <div className="font-medium">{safeCard.attendanceData?.present || 0}</div>
                    <div className="text-muted-foreground">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.attendanceData?.absent || 0}</div>
                    <div className="text-muted-foreground">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.attendanceData?.late || 0}</div>
                    <div className="text-muted-foreground">Late</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workload Card with Pending, Approved, and Disapproved - Shows Schedule Stats for Principal */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Class Schedules</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schedules?.length || 0}</div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div className="text-center">
                    <div className="font-medium">{schedules?.filter(s => s.status === 'PENDING').length || 0}</div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{schedules?.filter(s => s.status === 'APPROVED').length || 0}</div>
                    <div className="text-muted-foreground">Approved</div>
                  </div>
                  <div className="text-center col-span-2">
                    <div className="font-medium">{schedules?.filter(s => s.status === 'REJECTED').length || 0}</div>
                    <div className="text-muted-foreground">Disapproved</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Requests Card */}
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Service Requests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {serviceRequests?.reduce(
                    (sum, month) => 
                      sum + month.pending + month.inProgress + month.completed + month.rejected + month.forApproval,
                    0
                  ) || 0}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div className="text-center">
                    <div className="font-medium">
                      {serviceRequests?.reduce((sum, month) => sum + month.pending, 0) || 0}
                    </div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {serviceRequests?.reduce((sum, month) => sum + month.inProgress, 0) || 0}
                    </div>
                    <div className="text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {serviceRequests?.reduce((sum, month) => sum + month.completed, 0) || 0}
                    </div>
                    <div className="text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {serviceRequests?.reduce((sum, month) => sum + month.rejected, 0) || 0}
                    </div>
                    <div className="text-muted-foreground">Disapproved</div>
                  </div>
                  <div className="text-center col-span-2">
                    <div className="font-medium">
                      {serviceRequests?.reduce((sum, month) => sum + month.forApproval, 0) || 0}
                    </div>
                    <div className="text-muted-foreground">For Approval</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leave Requests Card with Pending, Approved, Disapproved */}
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Leave Requests
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeCard.leaveStats?.total || 0}</div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div className="text-center">
                    <div className="font-medium">{safeCard.leaveStats?.pending || 0}</div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{safeCard.leaveStats?.approved || 0}</div>
                    <div className="text-muted-foreground">Approved</div>
                  </div>
                  <div className="text-center col-span-2">
                    <div className="font-medium">{safeCard.leaveStats?.disapproved || 0}</div>
                    <div className="text-muted-foreground">Disapproved</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : userRole && userRole.name.toLowerCase() === 'admin' ? (
        // Admin-specific layout with filtered service requests
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Employees Card with breakdown */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeCard.totalEmployees || 0}</div>
              <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                <div className="text-center">
                  <div className="font-medium">
                    {safeCard.facultyByGrade?.admin || 0}
                  </div>
                  <div className="text-muted-foreground">Admin</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">
                    {safeCard.facultyByGrade?.principal || 0}
                  </div>
                  <div className="text-muted-foreground">Principal</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">
                    {safeCard.facultyByGrade?.secretary || 0}
                  </div>
                  <div className="text-muted-foreground">Secretary</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">
                    {(safeCard.facultyByGrade?.grade1 || 0) + 
                     (safeCard.facultyByGrade?.grade2 || 0) + 
                     (safeCard.facultyByGrade?.grade3 || 0) + 
                     (safeCard.facultyByGrade?.grade4 || 0) + 
                     (safeCard.facultyByGrade?.grade5 || 0) + 
                     (safeCard.facultyByGrade?.grade6 || 0)}
                  </div>
                  <div className="text-muted-foreground">Faculty</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{safeCard.facultyByGrade?.staff || 0}</div>
                  <div className="text-muted-foreground">Staff</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Card */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeCard.attendanceData?.total || 0}</div>
              <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                <div className="text-center">
                  <div className="font-medium">{safeCard.attendanceData?.present || 0}</div>
                  <div className="text-muted-foreground">Present</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{safeCard.attendanceData?.absent || 0}</div>
                  <div className="text-muted-foreground">Absent</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{safeCard.attendanceData?.late || 0}</div>
                  <div className="text-muted-foreground">Late</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Requests Card - ADMIN ONLY SEES THEIR OWN */}
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Service Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userFilteredServiceRequests.length}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div className="text-center">
                  <div className="font-medium">
                    {userFilteredServiceRequests.filter(r => r.status === "Pending").length}
                  </div>
                  <div className="text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">
                    {userFilteredServiceRequests.filter(r => r.status === "In Progress").length}
                  </div>
                  <div className="text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">
                    {userFilteredServiceRequests.filter(r => r.status === "Completed").length}
                  </div>
                  <div className="text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">
                    {userFilteredServiceRequests.filter(r => r.status === "Disapproved").length}
                  </div>
                  <div className="text-muted-foreground">Disapproved</div>
                </div>
                <div className="text-center col-span-2">
                  <div className="font-medium">
                    {userFilteredServiceRequests.filter(r => r.status === "For Approval").length}
                  </div>
                  <div className="text-muted-foreground">For Approval</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Leave Requests Card */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Leave Requests
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{personalLeaves.length}</div>
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div className="text-center">
                  <div className="font-medium">
                    {personalLeaves.filter(leave => leave.status === 'Pending').length}
                  </div>
                  <div className="text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">
                    {personalLeaves.filter(leave => leave.status === 'Approved').length}
                  </div>
                  <div className="text-muted-foreground">Approved</div>
                </div>
                <div className="text-center col-span-2">
                  <div className="font-medium">
                    {personalLeaves.filter(leave => leave.status === 'Disapproved').length}
                  </div>
                  <div className="text-muted-foreground">Disapproved</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : userRole && userRole.name.toLowerCase() === 'secretary' ? (
        // Secretary-specific layout with detailed information (same as Principal but without Workload)
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Employees Card with breakdown */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeCard.totalEmployees || 0}</div>
              <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                <div className="text-center">
                  <div className="font-medium">
                    {safeCard.facultyByGrade?.admin || 0}
                  </div>
                  <div className="text-muted-foreground">Admin</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">
                    {safeCard.facultyByGrade?.principal || 0}
                  </div>
                  <div className="text-muted-foreground">Principal</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">
                    {safeCard.facultyByGrade?.secretary || 0}
                  </div>
                  <div className="text-muted-foreground">Secretary</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">
                    {(safeCard.facultyByGrade?.grade1 || 0) + 
                     (safeCard.facultyByGrade?.grade2 || 0) + 
                     (safeCard.facultyByGrade?.grade3 || 0) + 
                     (safeCard.facultyByGrade?.grade4 || 0) + 
                     (safeCard.facultyByGrade?.grade5 || 0) + 
                     (safeCard.facultyByGrade?.grade6 || 0)}
                  </div>
                  <div className="text-muted-foreground">Faculty</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{safeCard.facultyByGrade?.staff || 0}</div>
                  <div className="text-muted-foreground">Staff</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Card with Present, Absent, Late */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attendance
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeCard.attendanceData?.total || 0}</div>
              <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                <div className="text-center">
                  <div className="font-medium">{safeCard.attendanceData?.present || 0}</div>
                  <div className="text-muted-foreground">Present</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{safeCard.attendanceData?.absent || 0}</div>
                  <div className="text-muted-foreground">Absent</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{safeCard.attendanceData?.late || 0}</div>
                  <div className="text-muted-foreground">Late</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Requests Card */}
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {serviceRequests?.reduce(
                  (sum, month) => 
                    sum + month.pending + month.inProgress + month.completed + month.rejected + month.forApproval,
                  0
                ) || 0}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div className="text-center">
                  <div className="font-medium">
                    {serviceRequests?.reduce((sum, month) => sum + month.pending, 0) || 0}
                  </div>
                  <div className="text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">
                    {serviceRequests?.reduce((sum, month) => sum + month.inProgress, 0) || 0}
                  </div>
                  <div className="text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">
                    {serviceRequests?.reduce((sum, month) => sum + month.completed, 0) || 0}
                  </div>
                  <div className="text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">
                    {serviceRequests?.reduce((sum, month) => sum + month.rejected, 0) || 0}
                  </div>
                  <div className="text-muted-foreground">Disapproved</div>
                </div>
                <div className="text-center col-span-2">
                  <div className="font-medium">
                    {serviceRequests?.reduce((sum, month) => sum + month.forApproval, 0) || 0}
                  </div>
                  <div className="text-muted-foreground">For Approval</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leave Requests Card with Pending, Approved, Disapproved */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Leave Requests
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeCard.leaveStats?.total || 0}</div>
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div className="text-center">
                  <div className="font-medium">{safeCard.leaveStats?.pending || 0}</div>
                  <div className="text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{safeCard.leaveStats?.approved || 0}</div>
                  <div className="text-muted-foreground">Approved</div>
                </div>
                <div className="text-center col-span-2">
                  <div className="font-medium">{safeCard.leaveStats?.disapproved || 0}</div>
                  <div className="text-muted-foreground">Disapproved</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Default layout for other roles
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeCard.totalEmployees}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-100 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Use detailed attendance data for all users */}
              <div className="text-2xl font-bold">{safeCard.attendanceData.total}</div>
              <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                <div className="text-center">
                  <div className="font-medium">{safeCard.attendanceData.present}</div>
                  <div className="text-muted-foreground">Present</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{safeCard.attendanceData.absent}</div>
                  <div className="text-muted-foreground">Absent</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{safeCard.attendanceData.late}</div>
                  <div className="text-muted-foreground">Late</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeCard.avgWorkload}h</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Leave Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(userRole && (userRole.name.toLowerCase() === 'staff' || userRole.name.toLowerCase() === 'faculty')) && safeCard.staffLeaveDetails ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{safeCard.staffLeaveDetails.total}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium">{safeCard.staffLeaveDetails.pending}</div>
                      <div className="text-muted-foreground">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{safeCard.staffLeaveDetails.approved}</div>
                      <div className="text-muted-foreground">Approved</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{safeCard.staffLeaveDetails.disapproved}</div>
                      <div className="text-muted-foreground">Disapproved</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold">{safeCard.leaveRequests}</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid - Monthly Attendance with label below */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 h-full">
        {/* Left Column - Monthly Attendance with quarterly selector */}
        <Card className="col-span-5 flex flex-col h-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Monthly Attendance</CardTitle>
                <CardDescription>
                  {getQuarterLabel(currentQuarter)} {new Date().getFullYear()}
                </CardDescription>
              </div>
              {/* Quarter navigation for principal role */}
              {userRole && userRole.name.toLowerCase() === 'principal' && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => switchQuarter('prev')}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">Q{currentQuarter}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => switchQuarter('next')}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="w-full flex-grow">
            {monthlyAttendance?.attendanceData && monthlyAttendance.attendanceData.length > 0 ? (
              <DtrMonthlyChart
                monthlyAttendance={monthlyAttendance.attendanceData}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No attendance data available
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
              Showing total attendance for the selected quarter
            </div>
            <div className="text-xs font-medium text-primary">
              Monthly Attendance
            </div>
          </CardFooter>
        </Card>

        {/* Right Column - For Principal: Schedule above Recent Logs, For others: Recent Logs only */}
        <div className="col-span-2 flex flex-col space-y-4">
          {/* Schedule Section - Only show for Principal role */}
          {userRole && userRole.name.toLowerCase() === 'principal' && (
            <Card>
              <CardHeader>
                <CardTitle>Class Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {isSchedulesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">Loading schedules...</div>
                  </div>
                ) : classSchedules.length > 0 ? (
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {classSchedules.slice(0, 5).map((schedule) => (
                      <div key={schedule.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-sm">{schedule.grade_section}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {schedule.school_year} • {schedule.adviser_teacher}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {schedule.total_learners} learners
                          </Badge>
                        </div>
                        {schedule.schedule_data && schedule.schedule_data.length > 0 && (
                          <div className="mt-2 text-xs">
                            <div className="flex justify-between text-muted-foreground">
                              <span>{schedule.schedule_data[0]?.time}</span>
                              <span>{schedule.schedule_data[0]?.mondayThursday}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No approved class schedules available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Logs Section or My Created Schedules for Gradeleader */}
          <Card className="flex flex-col flex-grow">
            <CardHeader>
              <CardTitle>
                {userRole && userRole.name.toLowerCase() === 'gradeleader' ? "My Created Schedules" : 
                 userRoles.some(role => role.name.toLowerCase() === 'faculty') && userRoles.some(role => role.name.toLowerCase() === 'gradeleader') ? "My Activities" : "Recent Logs"}
              </CardTitle>
              <CardDescription>
                {userRole && userRole.name.toLowerCase() === 'gradeleader'
                  ? "Schedules you have created"
                  : userRoles.some(role => role.name.toLowerCase() === 'faculty') && userRoles.some(role => role.name.toLowerCase() === 'gradeleader')
                  ? "Your recent activities as faculty and gradeleader"
                  : userRole && (userRole.name.toLowerCase() === 'staff' || userRole.name.toLowerCase() === 'faculty')
                  ? "Your recent activities in the system"
                  : "Latest activities across the system"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto" style={{ minHeight: '200px' }}>
              {userRole && userRole.name.toLowerCase() === 'gradeleader' ? (
                isSchedulesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-muted-foreground">Loading schedules...</div>
                  </div>
                ) : myCreatedSchedules.length > 0 ? (
                  <div className="space-y-4">
                    {myCreatedSchedules.slice(0, 5).map((schedule) => (
                      <div key={schedule.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-sm">{schedule.grade_section}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {schedule.school_year} • {schedule.adviser_teacher}
                            </p>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${schedule.status === 'APPROVED' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : schedule.status === 'REJECTED' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}
                          >
                            {schedule.status}
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Learners: {schedule.total_learners} (M: {schedule.male_learners}, F: {schedule.female_learners})
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Created: {new Date(schedule.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-muted-foreground text-center">
                      <p>No schedules created yet</p>
                      <p className="text-xs mt-1">Create your first schedule to get started</p>
                    </div>
                  </div>
                )
              ) : (
                // For users with both faculty and gradeleader roles, combine recent logs
                // For principal, show only 3 most recent logs
                userRoles.some(role => role.name.toLowerCase() === 'faculty') && userRoles.some(role => role.name.toLowerCase() === 'gradeleader') ? (
                  <RecentActivities activities={recentLogs} />
                ) : userRole && userRole.name.toLowerCase() === 'principal' ? (
                  <RecentActivities activities={recentLogs.slice(0, 3)} />
                ) : (
                  <RecentActivities activities={recentLogs} />
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {serviceRequests && serviceRequests.length > 0 ? (
        <ServiceRequestChart services={serviceRequests} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {userRole && userRole.name.toLowerCase() === 'staff'
                ? "Your Service Request Status Trends"
                : "Service Request Status Trends"}
            </CardTitle>
            <CardDescription>
              {userRole && userRole.name.toLowerCase() === 'staff'
                ? "Monthly trends of your service request statuses throughout the year"
                : "Monthly trends of service request statuses throughout the year"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
            {userRole && userRole.name.toLowerCase() === 'staff'
              ? "You haven't created any service requests yet"
              : "No service request data available"}
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default Dashboard;