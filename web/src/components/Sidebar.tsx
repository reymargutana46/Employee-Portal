import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  ClipboardList,
  Calendar,
  FileText,
  GraduationCap,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileCheck,
  BriefcaseBusiness,
} from "lucide-react";
import { Role } from "@/types/user";
import { useAuthStore } from "@/store/useAuthStore";

interface SidebarProps {
  isCollapsed: boolean;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  allowedRoles: Role[];
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const location = useLocation();
  const { userRoles, logout } = useAuth();

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
      // allowedRoles: ['admin', 'principal', 'secretary', 'faculty', 'staff'],
      allowedRoles: [
        {
          name: "admin",
        },
        {
          name: "principal",
        },
        {
          name: "secretary",
        },
        {
          name: "faculty",
        },
        {
          name: "staff",
        },
        {
          name: "gradeleader",
        },
      ],
    },
    {
      title: "Employees",
      href: "/employees",
      icon: Users,
      // allowedRoles: ["admin", "principal", "secretary"],
      allowedRoles: [
        {
          name: "admin",
        },
        {
          name: "principal",
        },
        {
          name: "secretary",
        },
      ],
    },
    {
      title: "Accounts",
      href: "/accounts",
      icon: Users,
      // allowedRoles: ["admin", "principal", "secretary"],
      allowedRoles: [
        {
          name: "admin",
        },
        {
          name: "secretary",
        },
      ],
    },
    {
      title: "Leave Management",
      href: "/leaves",
      icon: Calendar,
      // allowedRoles: ["admin", "principal", "secretary", "faculty", "staff"],
      allowedRoles: [
        {
          name: "admin",
        },
        {
          name: "principal",
        },
        {
          name: "secretary",
        },
        {
          name: "faculty",
        },
        {
          name: "staff",
        },
        {
          name: "gradeleader",
        },
      ],
    },
    {
      title: "DTR Records",
      href: "/dtr",
      icon: Clock,
      // allowedRoles: ["admin", "secretary", "faculty", "staff"],
      allowedRoles: [
        {
          name: "admin",
        },
        {
          name: "secretary",
        },
        {
          name: "faculty",
        },
        {
          name: "staff",
        },
        {
          name: "principal",
        },
        {
          name: "gradeleader",
        },
      ],
    },
    {
      title: "PDS Management",
      href: "/pds",
      icon: FileText,
      // allowedRoles: ["admin", "secretary", "staff"],
      allowedRoles: [
        {
          name: "admin",
        },
        {
          name: "principal",
        },
        {
          name: "secretary",
        },
        {
          name: "staff",
        },
        {
          name: "faculty",
        },
        {
          name: "gradeleader",
        },
      ],
    },
    {
      title: "Service Requests",
      href: "/service-requests",
      icon: FileCheck,
      // allowedRoles: ["admin", "principal", "secretary", "faculty", "staff"],
      allowedRoles: [
        {
          name: "admin",
        },
        {
          name: "principal",
        },
        {
          name: "secretary",
        },
        {
          name: "faculty",
        },
        {
          name: "staff",
        },
        {
          name: "gradeleader",
        },
      ],
    },
    {
      title: "Schedule",
      href: "/schedule",
      icon: Calendar,
      // allowedRoles: ["admin", "faculty"],
      allowedRoles: [
        {
          name: "faculty",
        },
        {
          name: "staff",
        },
        {
          name: "principal",
        },
        {
          name: "gradeleader",
        },
      ],
    },

    {
      title: "Workload",
      href: "/workload",
      icon: BriefcaseBusiness,
      allowedRoles: [
        {
          name: "principal",
        },
        {
          name: "gradeleader",
        },
      ],
    },
    {
      title: "System Logs",
      href: "/logs",
      icon: ClipboardList,
      allowedRoles: [
        {
          name: "admin",
        },
      ],
    },
    // {
    //   title: "Settings",
    //   href: "/settings",
    //   icon: Settings,
    //   allowedRoles: [
    //     {
    //       name: "admin",
    //     },
    //   ],
    //   // allowedRoles: ["admin"],
    // },
  ];

  // Show nav items if user has ANY of the allowed roles
  const hasGradeLeader = userRoles.some((role) => role.name.toLowerCase() === "gradeleader");
  const hasFaculty = userRoles.some((role) => role.name.toLowerCase() === "faculty");

  let filteredNavItems = navItems.filter((item) =>
    userRoles.some((role) =>
      item.allowedRoles.some((r) => r.name.toLowerCase() === role.name.toLowerCase())
    )
  );

  if (hasGradeLeader && !hasFaculty) {
    filteredNavItems = navItems.filter((item) => item.title === "Dashboard" || item.title === "Workload");
  }

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex justify-between items-center">
        {!isCollapsed ? (
          <h1 className="text-xl font-bold">Emport</h1>
        ) : (
          <h1 className="text-xl font-bold">EP</h1>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-md transition-colors",
              location.pathname === item.href
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              isCollapsed ? "justify-center" : "justify-start"
            )}
          >
            <item.icon
              className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")}
            />
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>

      <div className="py-4 px-2">
        <button
          onClick={logout}
          className={cn(
            "flex items-center px-3 py-2 w-full rounded-md hover:bg-sidebar-accent/50 transition-colors",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
