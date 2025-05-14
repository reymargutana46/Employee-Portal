import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Calendar,
  Clock,
  FileText,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const Dashboard = () => {
  const { user, token } = useAuthStore();
  console.log(user);
  console.log(token);
  const { userRoles } = useAuth();

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

  // Activity log demo data
  const activities = [
    {
      user: "John Doe",
      action: "submitted leave request",
      time: "10 minutes ago",
    },
    {
      user: "Maria Garcia",
      action: "updated PDS information",
      time: "25 minutes ago",
    },
    { user: "Robert Smith", action: "clocked in", time: "1 hour ago" },
    {
      user: "Jane Wilson",
      action: "approved service request",
      time: "2 hours ago",
    },
    { user: "David Brown", action: "clocked out", time: "4 hours ago" },
  ];

  // Announcements demo data
  const announcements = [
    {
      title: "System Maintenance",
      content:
        "The system will be down for maintenance on Saturday from 10pm to 2am.",
      date: "2025-04-15",
    },
    {
      title: "New DTR Policy",
      content:
        "Starting next month, all staff must clock in and out using the mobile app.",
      date: "2025-04-14",
    },
    {
      title: "Faculty Meeting",
      content: "Reminder: Faculty meeting in Room 301 tomorrow at 2pm.",
      date: "2025-04-13",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to your dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {currentRoleStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.color} rounded-full p-2 text-white`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && (
                <p className="text-xs text-muted-foreground">
                  {stat.change.startsWith("+") ? (
                    <span className="text-emerald-500">{stat.change}</span>
                  ) : stat.change.startsWith("-") ? (
                    <span className="text-red-500">{stat.change}</span>
                  ) : (
                    <span>{stat.change}</span>
                  )}
                  {" from last month"}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-6">
        {/* Recent Activity */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="rounded-full bg-primary p-2">
                    <Users className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement, index) => (
                <div key={index} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{announcement.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {announcement.date}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{announcement.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
