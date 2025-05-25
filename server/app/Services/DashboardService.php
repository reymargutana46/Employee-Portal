<?php

namespace App\Services;


use App\Models\Leaves\Leave;
use App\Models\Employee;
use App\Models\ServiceRequest;
use App\Models\ActivityLog;
use App\Models\WorkLoadHdr;
use App\Models\DtrAmtime;
use App\Models\DtrPmtime;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class DashboardService
{
    public function cards()
    {
        $now = Carbon::now();
        $lastMonth = $now->copy()->subMonth();

        // Total Employees
        $totalEmployees = Employee::count();

        $newEmployeesLastMonth = Employee::whereMonth('created_at', $lastMonth->month)
            ->whereYear('created_at', $lastMonth->year)
            ->count();

        $deletedEmployeesLastMonth = Employee::onlyTrashed()
            ->whereMonth('deleted_at', $lastMonth->month)
            ->whereYear('deleted_at', $lastMonth->year)
            ->count();

        $totalEmployeesLastMonth = $totalEmployees - ($newEmployeesLastMonth - $deletedEmployeesLastMonth);
        $employeeDifference = $totalEmployees - $totalEmployeesLastMonth;

        // Attendance Rate (employees with both AM and PM time-in this month)
        $employeeIds = Employee::pluck('id');

        $amIds = DtrAmtime::whereMonth('time_in', $now->month)
            ->whereYear('time_in', $now->year)
            ->pluck('employee_id');

        $pmIds = DtrPmtime::whereMonth('time_in', $now->month)
            ->whereYear('time_in', $now->year)
            ->pluck('employee_id');

        $attendingIds = $amIds->intersect($pmIds)->unique();
        $attendanceRate = ($attendingIds->count() / max($employeeIds->count(), 1)) * 100;

        $amLastMonth = DtrAmtime::whereMonth('time_in', $lastMonth->month)
            ->whereYear('time_in', $lastMonth->year)
            ->pluck('employee_id');

        $pmLastMonth = DtrPmtime::whereMonth('time_in', $lastMonth->month)
            ->whereYear('time_in', $lastMonth->year)
            ->pluck('employee_id');

        $attendingLastMonth = $amLastMonth->intersect($pmLastMonth)->unique();
        $attendanceRateLastMonth = ($attendingLastMonth->count() / max($employeeIds->count(), 1)) * 100;

        $attendanceRateDiff = $attendanceRate - $attendanceRateLastMonth;

        // Average Workload based on `from` and `to` date range
        $workloads = WorkLoadHdr::whereDate('from', '<=', $now->endOfMonth())
            ->whereDate('to', '>=', $now->startOfMonth())
            ->get();

        $uniqueEmployeesThisMonth = $workloads->pluck('assignee_id')->unique()->count();
        $avgWorkload = $uniqueEmployeesThisMonth > 0
            ? round($workloads->count() / $uniqueEmployeesThisMonth, 1)
            : 0;

        $workloadsLastMonth = WorkLoadHdr::whereDate('from', '<=', $lastMonth->endOfMonth())
            ->whereDate('to', '>=', $lastMonth->startOfMonth())
            ->get();

        $uniqueEmployeesLastMonth = $workloadsLastMonth->pluck('assignee_id')->unique()->count();
        $avgWorkloadLastMonth = $uniqueEmployeesLastMonth > 0
            ? round($workloadsLastMonth->count() / $uniqueEmployeesLastMonth, 1)
            : 0;

        $avgWorkloadDiff = $avgWorkload - $avgWorkloadLastMonth;

        // Leave Requests
        $leaveRequests = Leave::whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->count();

        $leaveRequestsLastMonth = Leave::whereMonth('created_at', $lastMonth->month)
            ->whereYear('created_at', $lastMonth->year)
            ->count();
        $leaveRequestsDiff = $leaveRequests - $leaveRequestsLastMonth;

        // Final response
        return [
            'totalEmployees' => $totalEmployees,
            'employeeDiff' => $employeeDifference,

            'attendanceRate' => round($attendanceRate, 2),
            'attendanceRateDiff' => round($attendanceRateDiff, 2),

            'avgWorkload' => $avgWorkload,
            'avgWorkloadDiff' => $avgWorkloadDiff,

            'leaveRequests' => $leaveRequests,
            'leaveRequestsDiff' => $leaveRequestsDiff,
        ];
    }
    public function MonthlyAttendance()
    {

        $now = Carbon::now();
        $year = $now->year;

        // Determine quarter
        $quarter = ($now->month <= 6) ? 1 : 2;
        $startMonth = ($quarter === 1) ? 1 : 7;
        $endMonth = ($quarter === 1) ? 6 : 12;

        $startDate = Carbon::create($year, $startMonth, 1)->startOfMonth();
        $endDate = Carbon::create($year, $endMonth, 1)->endOfMonth();

        // Define full list of months in quarter (e.g., ['2025-01', ..., '2025-06'])
        $months = collect(range($startMonth, $endMonth))->map(function ($m) use ($year) {
            return Carbon::create($year, $m)->format('Y-m');
        });

        // Query AM Attendance
        $amAttendance = DtrAmtime::selectRaw("strftime('%Y-%m', time_in) as month, COUNT(*) as count")
            ->whereBetween('time_in', [$startDate, $endDate])
            ->groupBy('month')
            ->pluck('count', 'month');

        // Query PM Attendance
        $pmAttendance = DTRPmtime::selectRaw("strftime('%Y-%m', time_in) as month, COUNT(*) as count")
            ->whereBetween('time_in', [$startDate, $endDate])
            ->groupBy('month')
            ->pluck('count', 'month');

        // Merge and fill missing months with 0
        $filler = 1; // Moved outside

        $attendanceData = $months->map(function ($month) use ($amAttendance, $pmAttendance, &$filler) {
            $count = ($amAttendance[$month] ?? 0) + ($pmAttendance[$month] ?? 0);
            $data = [
                'month' => Carbon::createFromFormat('Y-m', $month)->format('F'),
                'attendance' => $count,
                'fill' => "hsl(var(--chart-" . $filler . "))"
            ];
            $filler += 1; // Now properly increments across iterations
            return $data;
        });
        return [
            'attendanceData' => $attendanceData,
            'quarter' => $quarter,
        ];
    }


    public function ActivityLogs()
    {
        $activityLogs = ActivityLog::orderBy('created_at', 'desc')->take(5)->get();
        return $activityLogs->map(function ($log) {
            return [
                'performed_by' => $log->performed_by,
                'action' => $log->action,
                'description' => $log->description,
                'time' => Carbon::parse($log->created_at)->diffForHumans(),
            ];
        });
    }

    public function workloadsData()
    {
        $workloads = WorkLoadHdr::all();
        return [
            ['role' => 'Faculty', 'workload' => $workloads->where('type', 'FACULTY')->count(), 'fill' => "hsl(var(--chart-1))"],
            ['role' => 'Staff', 'workload' => $workloads->where('type', 'STAFF')->count(), 'fill' => "hsl(var(--chart-2))"],
            ['role' => 'Unassigned', 'workload' => $workloads->where('assignee_id', null)->count(), 'fill' => "hsl(var(--chart-3))"],

        ];
    }


    public function getServiceRequestCountPerMonthByStatus()
    {
        // Fetch all records for the current year
        $rawData = ServiceRequest::whereYear('created_at', now()->year)
            ->select('status', 'created_at')
            ->get();

        // Original statuses as saved in the DB
        $statuses = [
            "Pending" => "pending",
            "In Progress" => "inProgress",
            "Completed" => "completed",
            "Rejected" => "rejected",
            "For Approval" => "forApproval",
        ];

        // Group data in PHP
        $grouped = $rawData->groupBy(function ($item) {
            return Carbon::parse($item->created_at)->format('F'); // e.g., "January"
        })->map(function ($items, $month) use ($statuses) {
            $row = ['month' => $month];
            foreach ($statuses as $dbStatus => $camelKey) {
                $row[$camelKey] = $items->where('status', $dbStatus)->count();
            }
            return $row;
        });

        // Fill in missing months from January to last month in the data
        $firstMonth = 1;
        $lastMonth = $rawData->max(fn($item) => Carbon::parse($item->created_at)->month);
        $final = collect();

        for ($m = $firstMonth; $m <= $lastMonth; $m++) {
            $monthName = Carbon::create()->month($m)->format('F');
            $existing = $grouped->firstWhere('month', $monthName);

            if ($existing) {
                $final->push($existing);
            } else {
                $emptyRow = ['month' => $monthName];
                foreach ($statuses as $camelKey) {
                    $emptyRow[$camelKey] = 0;
                }
                $final->push($emptyRow);
            }
        }

        return $final->values();
    }
}
