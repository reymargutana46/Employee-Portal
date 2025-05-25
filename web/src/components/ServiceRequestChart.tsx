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
    label: "Rejected",
    color: "hsl(var(--chart-4))",
  },
  forApproval: {
    label: "For Approval",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

interface ServiceRequestProps {
services: ServiceRequestDate[]
}

export function ServiceRequestChart({ services}: ServiceRequestProps) {
  // Calculate total requests and completion rate
  const totalRequests = services.reduce(
    (sum, month) => sum + month.pending + month.inProgress + month.completed + month.rejected + month.forApproval,
    0,
  )
  const completedRequests = services.reduce((sum, month) => sum + month.completed, 0)
  const completionRate = ((completedRequests / totalRequests) * 100).toFixed(1)

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Service Request Status Trends</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Monthly trends of service request statuses throughout the year
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <LineChart
            accessibilityLayer
            data={services}
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
      <CardFooter className="pt-4 border-t">
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {completionRate}% completion rate this year <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Total of {totalRequests.toLocaleString()} service requests processed
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
