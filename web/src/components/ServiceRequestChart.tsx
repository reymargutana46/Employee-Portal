"use client"

import { TrendingUp } from "lucide-react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ServiceRequestDate } from "@/pages/Dashboard"
import { useAuthStore } from "@/store/useAuthStore"



const chartConfig = {
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-1))",
  },
  inProgress: {
    label: "In Progress",
    color: "hsl(var(--chart-2))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-3))",
  },
  rejected: {
    label: "Disapproved",
    color: "hsl(var(--chart-4))",
  },
  forApproval: {
    label: "For Approval",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

interface ServiceRequestProps {
  services: ServiceRequestDate[] | undefined | null
}

export function ServiceRequestChart({ services }: ServiceRequestProps) {
  // Handle case where services might be undefined or null
  const safeServices = services || [];
  
  // Get user roles from auth store
  const { userRoles } = useAuthStore();
  
  // Check if user is staff or faculty
  const isStaff = userRoles.some(role => role.name.toLowerCase() === 'staff');
  const isFaculty = userRoles.some(role => role.name.toLowerCase() === 'faculty');
  const isPersonalView = isStaff || isFaculty;
  
  // Calculate total requests and completion rate
  const totalRequests = safeServices.reduce(
    (sum, month) => sum + month.pending + month.inProgress + month.completed + month.rejected + month.forApproval,
    0,
  )
  const completedRequests = safeServices.reduce((sum, month) => sum + month.completed, 0)
  const completionRate = totalRequests > 0 ? ((completedRequests / totalRequests) * 100).toFixed(1) : "0.0"

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">
          {isPersonalView ? "Your Service Request Status Trends" : "Service Request Status Trends"}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {isPersonalView 
            ? "Monthly trends of your service request statuses throughout the year"
            : "Monthly trends of service request statuses throughout the year"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <LineChart
            accessibilityLayer
            data={safeServices}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
              label={{ value: "Number of Requests", angle: -90, position: "insideLeft" }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="completed"
              type="monotone"
              stroke="var(--color-completed)"
              strokeWidth={3}
              dot={{ fill: "var(--color-completed)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
            <Line
              dataKey="pending"
              type="monotone"
              stroke="var(--color-pending)"
              strokeWidth={3}
              dot={{ fill: "var(--color-pending)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
            <Line
              dataKey="inProgress"
              type="monotone"
              stroke="var(--color-inProgress)"
              strokeWidth={3}
              dot={{ fill: "var(--color-inProgress)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
            <Line
              dataKey="forApproval"
              type="monotone"
              stroke="var(--color-forApproval)"
              strokeWidth={3}
              dot={{ fill: "var(--color-forApproval)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
            <Line
              dataKey="rejected"
              type="monotone"
              stroke="var(--color-rejected)"
              strokeWidth={3}
              dot={{ fill: "var(--color-rejected)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>

    </Card>
  )
}