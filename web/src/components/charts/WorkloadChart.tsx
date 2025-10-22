import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

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
import { WorkloadData } from "@/pages/Dashboard";


const chartConfig = {
  visitors: {
    label: "Workloads",
  },
  chrome: {
    label: "faculty",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "staff",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface WorkloadChartProps {
  workload: WorkloadData[] | undefined | null;
}

export function WorkloadChart({ workload }: WorkloadChartProps) {
  // Handle case where workload might be undefined or null
  const safeWorkload = workload || [];
  
  const totalVisitors = React.useMemo(() => {
    return safeWorkload.reduce((acc, curr) => acc + curr.workload, 0);
  }, [safeWorkload]);

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <PieChart className="">
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={safeWorkload}
          dataKey="workload"
          nameKey="role"
          innerRadius={60}
          strokeWidth={5}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {totalVisitors.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Workloads
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}