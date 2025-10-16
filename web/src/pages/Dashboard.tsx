import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
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

import { Res } from "@/types/response";
import { ServiceRequestChart } from "@/components/ServiceRequestChart";

export interface DashboardCard {
  totalEmployees: number;
  employeeDiff: number;
  attendanceRate: number;
  attendanceRateDiff: number;
  avgWorkload: number;
  avgWorkloadDiff: number;
  leaveRequests: number;
  leaveRequestsDiff: number;
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
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestDate[]>(
    []
  );

  const { userRoles } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    axios
      .get<Res<DashboardData>>("/accounts/page/dashboard")
      .then((response) => {
        const {
          monthlyAttendance,
          card,
          recentlogs,
          workloads,
          serviceRequests,
        } = response.data.data;
        console.log(monthlyAttendance);
        setWorkload(workloads);
        setMonthlyAttendance(monthlyAttendance);
        setRecentLogs(recentlogs);
        setCard(card);
        console.log(serviceRequests);
        setServiceRequests(serviceRequests);

        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err.name);
        setIsLoading(false);
      });
  }, []);

  // Find the first applicable role for stats display
  const userRole = userRoles.length > 0 ? userRoles[0] : null;

  // Demo stats for different roles
  const stats = {
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
        title: "Service Requests",
        value: 24,
        icon: FileText,
        change: "+12%",
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
        title: "Leave Balance",
        value: "12 days",
        icon: Calendar,
        change: "",
        color: "bg-emerald-500",
      },
      {
        title: "Pending Requests",
        value: 2,
        icon: CheckSquare,
        change: "",
        color: "bg-amber-500",
      },
      {
        title: "Schedule Today",
        value: "4 hrs",
        icon: Clock,
        change: "",
        color: "bg-purple-500",
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
        value: 12,
        icon: CheckSquare,
        change: "+3",
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
        title: "Leave Balance",
        value: "15 days",
        icon: Calendar,
        change: "",
        color: "bg-emerald-500",
      },
      {
        title: "Pending Tasks",
        value: 7,
        icon: CheckSquare,
        change: "+2",
        color: "bg-amber-500",
      },
      {
        title: "Service Requests",
        value: 3,
        icon: FileText,
        change: "",
        color: "bg-blue-500",
      },
      {
        title: "DTR Exceptions",
        value: 1,
        icon: AlertTriangle,
        change: "-1",
        color: "bg-red-500",
      },
    ],
    secretary: [
      {
        title: "Pending Leaves",
        value: 8,
        icon: Calendar,
        change: "+3",
        color: "bg-amber-500",
      },
      {
        title: "DTR Records Today",
        value: 78,
        icon: Clock,
        change: "",
        color: "bg-blue-500",
      },
      {
        title: "Service Requests",
        value: 12,
        icon: FileText,
        change: "+5",
        color: "bg-emerald-500",
      },
      {
        title: "PDS Updates Needed",
        value: 6,
        icon: AlertTriangle,
        change: "-2",
        color: "bg-red-500",
      },
    ],
  };

  // Get the appropriate stats for the current user role
  const currentRoleStats = userRole ? stats[userRole.name] : [];

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

  // Don't render the dashboard if card data is not available
  if (!card) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">
            Failed to load dashboard data
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {formatDiff(card.employeeDiff)} from last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {formatDiff(card.attendanceRateDiff)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.avgWorkload}h</div>
            <p className="text-xs text-muted-foreground">
              {formatDiff(card.avgWorkloadDiff)}h from last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Leave Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.leaveRequests}</div>
            <p className="text-xs text-muted-foreground">
              {formatDiff(card.leaveRequestsDiff)} from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-5">
          <CardHeader>
            <CardTitle>Monthly Attendance</CardTitle>
            <CardDescription>
              {monthlyAttendance.quarter === 1
                ? "January - June "
                : "July - December"}
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <DtrMonthlyChart
              monthlyAttendance={monthlyAttendance.attendanceData}
            />
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
              Showing total attendance for the last 6 months
            </div>
          </CardFooter>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
            <CardDescription>
              Latest activities across the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivities activities={recentLogs} />
          </CardContent>
        </Card>
      </div>
      <ServiceRequestChart services={serviceRequests} />

      {/* Conditionally render workload section - hide for admin users only */}
      {/* Principals, Faculty, Staff, GradeLeader, and Secretary should see workload */}
      {!userRoles.some(role => role.name.toLowerCase() === 'admin') && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-9">
          <Card className="col-span-5">
            <CardHeader>
              <CardTitle>Workload</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <WorkloadChart workload={workload} />
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="leading-none text-muted-foreground">
                Showing total Workload assigned and unassigned
              </div>
            </CardFooter>
          </Card>

          {/* <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overloaded Employees</CardTitle>
              <CardDescription>
                Employees exceeding workload thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Workload</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overloadedEmployees.map((employee) => (
                    <TableRow key={employee.name}>
                      <TableCell className="font-medium">
                        {employee.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-red-100 text-red-800 hover:bg-red-100"
                        >
                          {employee.workload} hrs
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card> */}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
