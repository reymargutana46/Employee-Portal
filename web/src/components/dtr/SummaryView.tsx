
import { useMemo } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DateRange } from "react-day-picker"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { DTRList } from "@/types/dtr"


interface SummaryViewProps {
  records: DTRList[]
  dateRange: DateRange | undefined
  selectedEmployee: string
}

const DTRSummaryView = ({ records, dateRange, selectedEmployee }: SummaryViewProps) => {
  // Generate summary data
  const summaryData = useMemo(() => {
    // Status counts
    const statusCounts = {
      Present: records.filter((r) => r.status === "Present").length,
      Leave: records.filter((r) => r.status === "Leave").length,
    //   Absent: records.filter((r) => r.status === "Absent").length,
    //   Late: records.filter((r) => r.status === "Late").length,
    }

    // Status by day of week
    const dayOfWeekData = [0, 1, 2, 3, 4, 5, 6].map((dayNum) => {
      const dayRecords = records.filter((record) => {
        const date = new Date(record.date)
        return date.getDay() === dayNum
      })

      return {
        name: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayNum],
        Present: dayRecords.filter((r) => r.status === "Present").length,
        Leave: dayRecords.filter((r) => r.status === "Leave").length,
        // Absent: dayRecords.filter((r) => r.status === "Absent").length,
        // Late: dayRecords.filter((r) => r.status === "Late").length,
      }
    })

    // Employee attendance (if all employees selected)
    const employeeData =
      selectedEmployee === "all"
        ? Array.from(new Set(records.map((r) => r.employee)))
            .map((emp) => {
              const empRecords = records.filter((r) => r.employee === emp)
              return {
                name: emp,
                Present: empRecords.filter((r) => r.status === "Present").length,
                Leave: empRecords.filter((r) => r.status === "Leave").length,
                // Absent: empRecords.filter((r) => r.status === "Absent").length,
                // Late: empRecords.filter((r) => r.status === "Late").length,
                total: empRecords.length,
              }
            })
            .sort((a, b) => b.total - a.total)
            .slice(0, 10)
        : []

    // Pie chart data
    const pieData = [
      { name: "Present", value: statusCounts.Present, color: "#22c55e" },
      { name: "Leave", value: statusCounts.Leave, color: "#f97316" },
    //   { name: "Absent", value: statusCounts.Absent, color: "#ef4444" },
    //   { name: "Late", value: statusCounts.Late, color: "#f59e0b" },
    ]

    return {
      statusCounts,
      dayOfWeekData,
      employeeData,
      pieData,
    }
  }, [records, selectedEmployee])

  // Format date range for display
  const dateRangeText =
    dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
      : "All dates"

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summaryData.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {summaryData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Attendance by Day of Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summaryData.dayOfWeekData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Present" fill="#22c55e" />
                  <Bar dataKey="Leave" fill="#f97316" />
                  <Bar dataKey="Absent" fill="#ef4444" />
                  <Bar dataKey="Late" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedEmployee === "all" && summaryData.employeeData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Employee Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summaryData.employeeData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Present" fill="#22c55e" stackId="a" />
                  <Bar dataKey="Leave" fill="#f97316" stackId="a" />
                  <Bar dataKey="Absent" fill="#ef4444" stackId="a" />
                  <Bar dataKey="Late" fill="#f59e0b" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Attendance Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Present Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {records.length > 0
                  ? `${((summaryData.statusCounts.Present / records.length) * 100).toFixed(1)}%`
                  : "0%"}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Leave Rate</p>
              <p className="text-2xl font-bold text-orange-600">
                {records.length > 0 ? `${((summaryData.statusCounts.Leave / records.length) * 100).toFixed(1)}%` : "0%"}
              </p>
            </div>

            {/* <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Absent Rate</p>
              <p className="text-2xl font-bold text-red-600">
                {records.length > 0
                  ? `${((summaryData.statusCounts.Absent / records.length) * 100).toFixed(1)}%`
                  : "0%"}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Late Rate</p>
              <p className="text-2xl font-bold text-amber-600">
                {records.length > 0 ? `${((summaryData.statusCounts.Late / records.length) * 100).toFixed(1)}%` : "0%"}
              </p>
            </div> */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DTRSummaryView
