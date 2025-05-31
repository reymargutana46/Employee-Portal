import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import React from "react";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import LeaveManagement from "./pages/LeaveManagement";
import NotFound from "./pages/NotFound";
import DTRDashboard from "./pages/DTRDashboard";
import PDS from "./pages/PDS";
import ServiceRequests from "./pages/ServiceRequests";
import Schedule from "./pages/Schedule";
import Students from "./pages/Students";
import Workload from "./pages/Workload";
import SystemLogs from "./pages/SystemLogs";
import Settings from "./pages/Settings";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import { Role } from "./types/user";
import Accounts from "./pages/Accounts";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notification";

type UserRole = "admin" | "principal" | "secretary" | "faculty" | "staff";

interface RouteConfig {
  path: string;
  element: React.ReactNode;
  allowedRoles: Role[];
}

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: Role[];
}) => {
  const { isAuthenticated, canAccessRoute } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has any of the required roles
  if (!canAccessRoute(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Define routes with their allowed roles
  const protectedRoutes: RouteConfig[] = [
    {
      path: "/dashboard",
      element: <Dashboard />,
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
      ],
      // allowedRoles: [name: "admin", "principal", "secretary", "faculty", "staff"],
    },
    {
      path: "/employees",
      element: <Employees />,
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
      // allowedRoles: ["admin", "principal", "secretary"],
    },
    {
      path: "/accounts",
      element: <Accounts />,
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
      // allowedRoles: ["admin", "principal", "secretary"],
    },
    {
      path: "/leaves",
      element: <LeaveManagement />,
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
      ],
    },
    {
      path: "/dtr",
      element: <DTRDashboard />,
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
      ],
      // allowedRoles: ["admin", "secretary", "faculty", "staff"],
    },
    {
      path: "/pds",
      element: <PDS />,
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
      ],
      // allowedRoles: ["admin", "secretary", "staff"],
    },
    {
      path: "/service-requests",
      element: <ServiceRequests />,
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
      ],
      // allowedRoles: ["admin", "principal", "secretary", "faculty", "staff"],
    },
    {
      path: "/schedule",
      element: <Schedule />,
      allowedRoles: [
        {
          name: "admin",
        },
        {
          name: "faculty",
        },
      ],
      // allowedRoles: ["admin", "faculty"],
    },

    {
      path: "/workload",
      element: <Workload />,
      allowedRoles: [
        {
          name: "principal",
        },
      ],
      // allowedRoles: ["admin", "principal", "faculty"],
    },
    {
      path: "/logs",
      element: <SystemLogs />,
      allowedRoles: [
        {
          name: "admin",
        },
      ],
      // allowedRoles: ["admin"],
    },
    {
      path: "/profile",
      element: <Profile />,
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
      ],
    },
    // {
    //   path: "/settings",
    //   element: <Settings />,
    //   allowedRoles: [
    //     {
    //       name: "admin",
    //     },
    //   ],
    // },
    {
      path: "/notifications",
      element: <Notifications />,
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
      ],
    },
  ];

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route
        path="/login"
        element={
          !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
        }
      />

      {protectedRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute allowedRoles={route.allowedRoles}>
              <Layout>{route.element}</Layout>
            </ProtectedRoute>
          }
        />
      ))}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <React.StrictMode>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </React.StrictMode>
  );
};

export default App;
