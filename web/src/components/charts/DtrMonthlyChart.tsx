import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { attendanceData } from "@/pages/Dashboard";

const chartConfig = {
  attendance: {
    label: "Attendance",
    color: "hsl(var(--chart-1))",
  },
  January: {
    label: "January",
    color: "hsl(var(--chart-1))",
  },
  February: {
    label: "February",
  },
  March: {
    label: "March",
    color: "hsl(var(--chart-3))",
  },
  April: {
    label: "April",
    color: "hsl(var(--chart-4))",
  },
  May: {
    label: "May",
    color: "hsl(var(--chart-5))",
  },
  June: {
    label: "June",
    color: "hsl(var(--chart-6))",
  },
} satisfies ChartConfig;

interface DtrMonthlyChartProps {
  monthlyAttendance: attendanceData[] | undefined | null
};

export default function DtrMonthlyChart({ monthlyAttendance }: DtrMonthlyChartProps) {
  // Handle case where monthlyAttendance might be undefined or null
  const safeMonthlyAttendance = monthlyAttendance || [];
  
  return (
    <ChartContainer config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={safeMonthlyAttendance}
        layout="vertical"
        margin={{
          left: 0,
        }}
      >
        <YAxis
          dataKey="month"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <XAxis dataKey="attendance" type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="attendance" layout="vertical" radius={5} />
      </BarChart>
    </ChartContainer>
  );
}