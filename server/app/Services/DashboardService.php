<?php

namespace App\Services;


use App\Models\Leaves\Leave;
use App\Models\Employee;
use App\Models\ServiceRequest;
use App\Models\ActivityLog;
use App\Models\WorkLoadHdr;
use App\Models\DtrAmtime;
use App\Models\DtrPmtime;
use Auth;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class DashboardService
{
    protected $user;
    protected $allowedRoles = ['Admin', 'Principal', 'Secretary'];
    protected $employee;

    public function __construct()
    {
        $this->user = Auth::user();
        $this->employee = Employee::where('username_id', $this->user->username)->first();
    }

    protected function restrictQuery($query, $field = 'employee_id')
    {
        if (!$this->user->hasRole($this->allowedRoles)) {
            $employee = Employee::where('username_id', $this->user->username)->first();
            return $query->where($field, optional($employee)->id);
        }
        return $query;
    }

    public function cards()
    {
        try {
            $now = Carbon::now();
            $lastMonth = $now->copy()->subMonth();

            $employeeQuery = Employee::query();
            if (!$this->user->hasRole($this->allowedRoles)) {
                $employeeQuery->where('id', $this->employee->id);
            }

            $totalEmployees = $employeeQuery->count();

            $newEmployeesLastMonth = $employeeQuery->whereMonth('created_at', $lastMonth->month)
                ->whereYear('created_at', $lastMonth->year)
                ->count();

            $deletedEmployeesLastMonth = Employee::onlyTrashed()
                ->whereMonth('deleted_at', $lastMonth->month)
                ->whereYear('deleted_at', $lastMonth->year)
                ->when(!$this->user->hasRole($this->allowedRoles), function ($query) {
                    $query->where('id', $this->employee->id);
                })
                ->count();

            $totalEmployeesLastMonth = $totalEmployees - ($newEmployeesLastMonth - $deletedEmployeesLastMonth);
            $employeeDifference = $totalEmployees - $totalEmployeesLastMonth;

            $employeeIds = $employeeQuery->pluck('id');

            // Calculate detailed attendance data instead of just a rate
            $amRecords = $this->restrictQuery(DtrAmtime::whereDate('time_in', $now->toDateString()))->get();
            $pmRecords = $this->restrictQuery(DtrPmtime::whereDate('time_in', $now->toDateString()))->get();
            
            // For staff users, we'll calculate their personal attendance
            if (!$this->user->hasRole($this->allowedRoles)) {
                // Start with zero values
                $workDays = 0;
                $presentDays = 0;
                $absentDays = 0;
                $lateDays = 0;
                
                // Only calculate attendance if there are DTR records
                $startDate = $now->copy()->startOfMonth();
                $endDate = $now->copy()->endOfMonth();
                
                // Get DTR records for the current month for this employee
                $employeeAmRecords = $this->restrictQuery(
                    DtrAmtime::whereBetween('time_in', [$startDate, $endDate])
                )->get();
                
                $employeePmRecords = $this->restrictQuery(
                    DtrPmtime::whereBetween('time_in', [$startDate, $endDate])
                )->get();
                
                // Only calculate work days and attendance if there are DTR records
                if ($employeeAmRecords->count() > 0 || $employeePmRecords->count() > 0) {
                    // Count work days (Monday to Friday) in the current month
                    $workDays = 0;
                    $currentDate = $startDate->copy();
                    while ($currentDate <= $endDate) {
                        // Check if it's a weekday (Monday=1 to Friday=5)
                        if ($currentDate->isWeekday()) {
                            $workDays++;
                        }
                        $currentDate->addDay();
                    }
                    
                    // Count present days (days with both AM and PM records)
                    $presentDays = 0;
                    $currentDate = $startDate->copy();
                    while ($currentDate <= $endDate) {
                        if ($currentDate->isWeekday()) {
                            $dateString = $currentDate->toDateString();
                            
                            // Check if there are AM records for this day
                            $hasAmRecord = $employeeAmRecords->filter(function ($record) use ($dateString) {
                                return Carbon::parse($record->time_in)->toDateString() === $dateString;
                            })->count() > 0;
                            
                            // Check if there are PM records for this day
                            $hasPmRecord = $employeePmRecords->filter(function ($record) use ($dateString) {
                                return Carbon::parse($record->time_in)->toDateString() === $dateString;
                            })->count() > 0;
                            
                            // Count as present only if both AM and PM records exist
                            if ($hasAmRecord && $hasPmRecord) {
                                $presentDays++;
                            }
                        }
                        $currentDate->addDay();
                    }
                    
                    // Calculate absent days (work days minus present days)
                    $absentDays = max(0, $workDays - $presentDays);
                }
                
                $attendanceData = [
                    'total' => $workDays,
                    'present' => $presentDays,
                    'absent' => $absentDays,
                    'late' => $lateDays
                ];
            } else {
                // For admin/principal/secretary, calculate for all employees
                $totalAttendance = $amRecords->count() + $pmRecords->count();
                $presentEmployees = $amRecords->pluck('employee_id')->intersect($pmRecords->pluck('employee_id'))->count();
                $absentEmployees = $employeeIds->count() - $presentEmployees;
                $lateEmployees = 0; // Would need time comparison logic to determine this properly
                
                $attendanceData = [
                    'total' => $totalAttendance,
                    'present' => $presentEmployees,
                    'absent' => $absentEmployees,
                    'late' => $lateEmployees
                ];
            }

            // Get faculty counts by grade level for admin, principal, and secretary dashboard
            $facultyByGrade = [];
            if ($this->user->hasRole(['Admin', 'Principal', 'Secretary'])) {
                // Define faculty positions (these are teaching positions)
                $facultyPositions = [
                    'Teacher I', 'Teacher II', 'Teacher III', 
                    'Master Teacher I', 'Master Teacher II', 
                    'SPED Teacher I', 'SPET I'
                ];
                
                // Get faculty employees
                $facultyEmployees = Employee::whereIn('position_id', function($query) use ($facultyPositions) {
                    $query->select('id')
                          ->from('positions')
                          ->whereIn('title', $facultyPositions);
                })->get();
                
                // Get role-based counts
                $adminCount = 0;
                $principalCount = 0;
                $secretaryCount = 0;
                $staffCount = 0;
                
                // Get all employees with their roles
                $employees = Employee::with(['user.roles'])->get();
                
                foreach ($employees as $employee) {
                    // Check if employee has a user account with roles
                    if ($employee->user && $employee->user->roles) {
                        $hasAdminRole = false;
                        $hasPrincipalRole = false;
                        $hasSecretaryRole = false;
                        $hasStaffRole = false;
                        
                        // Check each role for this employee
                        foreach ($employee->user->roles as $role) {
                            switch ($role->name) {
                                case 'Admin':
                                    $hasAdminRole = true;
                                    $adminCount++;
                                    break;
                                case 'Principal':
                                    $hasPrincipalRole = true;
                                    $principalCount++;
                                    break;
                                case 'Secretary':
                                    $hasSecretaryRole = true;
                                    $secretaryCount++;
                                    break;
                                case 'Staff':
                                    $hasStaffRole = true;
                                    $staffCount++;
                                    break;
                            }
                        }
                    }
                    // Employees without user accounts or without explicit Staff role are not counted
                }
                
                // Initialize grade level counts with role-based counts
                $facultyByGrade = [
                    'admin' => $adminCount,
                    'principal' => $principalCount,
                    'secretary' => $secretaryCount,
                    'grade1' => 0,
                    'grade2' => 0,
                    'grade3' => 0,
                    'grade4' => 0,
                    'grade5' => 0,
                    'grade6' => 0,
                    'staff' => $staffCount
                ];
                
                // For now, we'll distribute faculty counts evenly as we don't have grade level data in the database
                // In a real implementation, this would come from actual assignment data
                $facultyCount = $facultyEmployees->count();
                if ($facultyCount > 0) {
                    $perGrade = floor($facultyCount / 6); // 6 grade levels (Grade 1 to Grade 6)
                    $remainder = $facultyCount % 6;
                    
                    foreach (array_keys($facultyByGrade) as $key) {
                        // Skip role-based counts and staff
                        if (!in_array($key, ['admin', 'principal', 'secretary', 'staff'])) {
                            $facultyByGrade[$key] = $perGrade + ($remainder > 0 ? 1 : 0);
                            $remainder--;
                        }
                    }
                }
            }

            $workloads = WorkLoadHdr::whereDate('from', '<=', $now->endOfMonth())
                ->whereDate('to', '>=', $now->startOfMonth())
                ->when(!$this->user->hasRole($this->allowedRoles), function ($query) {
                    $query->where('assignee_id', $this->employee->id);
                })
                ->get();

            $uniqueEmployeesThisMonth = $workloads->pluck('assignee_id')->unique()->count();
            $avgWorkload = $uniqueEmployeesThisMonth > 0
                ? round($workloads->count() / $uniqueEmployeesThisMonth, 1)
                : 0;

            $workloadsLastMonth = WorkLoadHdr::whereDate('from', '<=', $lastMonth->endOfMonth())
                ->whereDate('to', '>=', $lastMonth->startOfMonth())
                ->when(!$this->user->hasRole($this->allowedRoles), function ($query) {
                    $query->where('assignee_id', $this->employee->id);
                })
                ->get();

            $uniqueEmployeesLastMonth = $workloadsLastMonth->pluck('assignee_id')->unique()->count();
            $avgWorkloadLastMonth = $uniqueEmployeesLastMonth > 0
                ? round($workloadsLastMonth->count() / $uniqueEmployeesLastMonth, 1)
                : 0;

            $avgWorkloadDiff = $avgWorkload - $avgWorkloadLastMonth;

            // Get workload statistics by status for secretary and principal dashboard
            $workloadStats = [
                'total' => $workloads->count(),
                'approved' => $workloads->where('status', 'APPROVED')->count(),
                'disapproved' => $workloads->where('status', 'REJECTED')->count()
            ];

            $leaveRequests = Leave::whereMonth('created_at', $now->month)
                ->whereYear('created_at', $now->year)
                ->when(!$this->user->hasRole($this->allowedRoles), function ($query) {
                    $query->where('employee_id', $this->employee->id);
                })
                ->count();

            $leaveRequestsLastMonth = Leave::whereMonth('created_at', $lastMonth->month)
                ->whereYear('created_at', $lastMonth->year)
                ->when(!$this->user->hasRole($this->allowedRoles), function ($query) {
                    $query->where('employee_id', $this->employee->id);
                })
                ->count();

            $leaveRequestsDiff = $leaveRequests - $leaveRequestsLastMonth;

            // Get detailed leave counts by status for all employees (for secretary and principal)
            $leaveStats = [];
            if ($this->user->hasRole(['Secretary', 'Principal'])) {
                $leaveStats = [
                    'total' => Leave::count(),
                    'pending' => Leave::where('status', 'Pending')->count(),
                    'approved' => Leave::where('status', 'Approved')->count(),
                    'disapproved' => Leave::where('status', 'Disapproved')->count(),
                ];
            }
            // Get detailed leave counts by status for staff and faculty members
            else if (!$this->user->hasRole($this->allowedRoles)) {
                $staffLeaveDetails = [
                    'total' => Leave::where('employee_id', $this->employee->id)->count(),
                    'pending' => Leave::where('employee_id', $this->employee->id)->where('status', 'Pending')->count(),
                    'approved' => Leave::where('employee_id', $this->employee->id)->where('status', 'Approved')->count(),
                    'disapproved' => Leave::where('employee_id', $this->employee->id)->where('status', 'Disapproved')->count(),
                ];
            }

            return [
                'totalEmployees' => $totalEmployees,
                'employeeDiff' => $employeeDifference,
                'facultyByGrade' => $facultyByGrade,

                // Return detailed attendance data instead of just a rate
                'attendanceData' => $attendanceData,

                'avgWorkload' => $avgWorkload,
                'avgWorkloadDiff' => $avgWorkloadDiff,
                'workloadStats' => $workloadStats,

                'leaveRequests' => $leaveRequests,
                'leaveRequestsDiff' => $leaveRequestsDiff,
                'leaveStats' => $leaveStats,
                'staffLeaveDetails' => $staffLeaveDetails ?? [],
            ];
        } catch (\Exception $e) {
            \Log::error('Dashboard cards error: ' . $e->getMessage());
            // Return default values if there's an error
            return [
                'totalEmployees' => 0,
                'employeeDiff' => 0,
                'facultyByGrade' => [],
                'attendanceData' => [
                    'total' => 0,
                    'present' => 0,
                    'absent' => 0,
                    'late' => 0
                ],
                'avgWorkload' => 0,
                'avgWorkloadDiff' => 0,
                'workloadStats' => [
                    'total' => 0,
                    'approved' => 0,
                    'disapproved' => 0
                ],
                'leaveRequests' => 0,
                'leaveRequestsDiff' => 0,
                'leaveStats' => [],
                'staffLeaveDetails' => [],
            ];
        }
    }

    public function MonthlyAttendance($quarter = null)
    {
        try {
            $now = Carbon::now();
            
            // If no quarter specified, determine based on current month
            if ($quarter === null) {
                $quarter = ($now->month <= 6) ? 1 : 2;
            }
            
            $year = $now->year;
            $startMonth = ($quarter === 1) ? 1 : 7;
            $endMonth = ($quarter === 1) ? 6 : 12;

            $startDate = Carbon::create($year, $startMonth, 1)->startOfMonth();
            $endDate = Carbon::create($year, $endMonth, 1)->endOfMonth();

            $months = collect(range($startMonth, $endMonth))->map(function ($m) use ($year) {
                return Carbon::create($year, $m)->format('Y-m');
            });

            $amQuery = DtrAmtime::whereBetween('time_in', [$startDate, $endDate]);
            $pmQuery = DtrPmtime::whereBetween('time_in', [$startDate, $endDate]);

            if (!$this->user->hasRole($this->allowedRoles)) {
                $amQuery->where('employee_id', $this->employee->id);
                $pmQuery->where('employee_id', $this->employee->id);
            }

            // Use COALESCE to handle potential NULL values and ensure we get proper counts
            $amAttendance = $amQuery->selectRaw("strftime('%Y-%m', time_in) as month, COUNT(*) as count")
                ->groupBy('month')
                ->pluck('count', 'month');

            $pmAttendance = $pmQuery->selectRaw("strftime('%Y-%m', time_in) as month, COUNT(*) as count")
                ->groupBy('month')
                ->pluck('count', 'month');

            $filler = 1;
            $attendanceData = $months->map(function ($month) use ($amAttendance, $pmAttendance, &$filler) {
                // Handle potential NULL values by defaulting to 0
                $amCount = $amAttendance[$month] ?? 0;
                $pmCount = $pmAttendance[$month] ?? 0;
                $count = $amCount + $pmCount;
                
                return [
                    'month' => Carbon::createFromFormat('Y-m', $month)->format('F'),
                    'attendance' => $count,
                    'fill' => "hsl(var(--chart-" . $filler++ . "))",
                ];
            });

            return [
                'attendanceData' => $attendanceData,
                'quarter' => $quarter,
            ];
        } catch (\Exception $e) {
            \Log::error('Monthly attendance error: ' . $e->getMessage());
            // Return default values if there's an error
            return [
                'attendanceData' => [],
                'quarter' => 1,
            ];
        }
    }

    public function ActivityLogs()
    {
        try {
            // For staff, faculty, and secretary users, only show their own activities (most recent first)
            if (!$this->user->hasRole($this->allowedRoles)) {
                $activities = ActivityLog::where('performed_by', $this->user->username)
                    ->orderBy('created_at', 'desc')
                    ->take(5) // Limit to 5 most recent activities for faculty/staff users
                    ->get();

                // Log for debugging
                \Log::info('Faculty/Staff user activity logs result for user: ' . $this->user->username . ', result count: ' . $activities->count());

                $result = $activities->map(function ($log) {
                    return [
                        'performed_by' => $log->performed_by,
                        'action' => $log->action,
                        'description' => $log->description,
                        'time' => Carbon::parse($log->created_at)->format('Y-m-d H:i:s'),
                    ];
                })->values();

                // Log for debugging
                // \Log::info('Staff user activity logs result for user: ' . $this->user->username . ', result count: ' . $result->count());
                return $result;
            }

            // For admin/principal/secretary users, prioritize their own activities
            // Get the current user's activities first (most recent)
            $userActivities = ActivityLog::where('performed_by', $this->user->username)
                ->orderBy('created_at', 'desc')
                ->take(5) // Limit to 5 most recent user activities
                ->get();

            // For secretary users, only show their own activities
            if ($this->user->hasRole('Secretary')) {
                $result = $userActivities->map(function ($log) {
                    return [
                        'performed_by' => $log->performed_by,
                        'action' => $log->action,
                        'description' => $log->description,
                        'time' => Carbon::parse($log->created_at)->format('Y-m-d H:i:s'),
                    ];
                })->values();

                return $result;
            }

            // For principal users, show their own activities ordered from oldest to latest
            if ($this->user->hasRole('Principal')) {
                $principalActivities = ActivityLog::where('performed_by', $this->user->username)
                    ->orderBy('created_at', 'asc') // Order from oldest to latest
                    ->take(10) // Show up to 10 activities
                    ->get();

                $result = $principalActivities->map(function ($log) {
                    return [
                        'performed_by' => $log->performed_by,
                        'action' => $log->action,
                        'description' => $log->description,
                        'time' => Carbon::parse($log->created_at)->format('Y-m-d H:i:s'),
                    ];
                })->values();

                return $result;
            }

            // For admin users, show exactly 5 recent activities (their own + others if needed)
            if ($this->user->hasRole('Admin')) {
                // Get additional recent activities from other users
                $otherActivities = ActivityLog::where('performed_by', '!=', $this->user->username)
                    ->orderBy('created_at', 'desc')
                    ->take(5 - $userActivities->count()) // Fill up to 5 total activities
                    ->get();

                // Merge user activities first, then other activities
                $allActivities = $userActivities->merge($otherActivities)
                    ->sortByDesc('created_at') // Sort by timestamp descending
                    ->take(5); // Ensure we don't exceed 5 activities

                $result = $allActivities->map(function ($log) {
                    return [
                        'performed_by' => $log->performed_by,
                        'action' => $log->action,
                        'description' => $log->description,
                        'time' => Carbon::parse($log->created_at)->format('Y-m-d H:i:s'),
                    ];
                })->values(); // Ensure we return a reindexed array

                return $result;
            }

            // Get additional recent activities from other users (for non-admin roles that reach this point)
            $otherActivities = ActivityLog::where('performed_by', '!=', $this->user->username)
                ->orderBy('created_at', 'desc')
                ->take(10 - $userActivities->count()) // Fill up to 10 total activities
                ->get();

            // Merge user activities first, then other activities
            $allActivities = $userActivities->merge($otherActivities)
                ->sortByDesc('created_at') // Sort by timestamp descending
                ->take(10); // Ensure we don't exceed 10 activities

            $result = $allActivities->map(function ($log) {
                return [
                    'performed_by' => $log->performed_by,
                    'action' => $log->action,
                    'description' => $log->description,
                    'time' => Carbon::parse($log->created_at)->format('Y-m-d H:i:s'),
                ];
            })->values(); // Ensure we return a reindexed array

            // Log for debugging
            // \Log::info('Admin/Principal/Secretary activity logs result for user: ' . $this->user->username . ', user activities: ' . $userActivities->count() . ', other activities: ' . $otherActivities->count() . ', total: ' . $result->count());

            return $result;
        } catch (\Exception $e) {
            \Log::error('Activity logs error: ' . $e->getMessage());
            return [];
        }
    }

    public function workloadsData()
    {
        try {
            $query = WorkLoadHdr::query();
            if (!$this->user->hasRole($this->allowedRoles)) {
                $query->where('assignee_id', $this->employee->id);
            }

            $workloads = $query->get();

            // Return workload statistics by status for all users
            return [
                ['role' => 'Total', 'workload' => $workloads->count(), 'fill' => "hsl(var(--chart-1))"],
                ['role' => 'Pending', 'workload' => $workloads->where('status', 'PENDING')->count(), 'fill' => "hsl(var(--chart-2))"],
                ['role' => 'Approved', 'workload' => $workloads->where('status', 'APPROVED')->count(), 'fill' => "hsl(var(--chart-3))"],
                ['role' => 'Disapproved', 'workload' => $workloads->where('status', 'REJECTED')->count(), 'fill' => "hsl(var(--chart-4))"],
            ];
        } catch (\Exception $e) {
            \Log::error('Workloads data error: ' . $e->getMessage());

            // Return default workload statistics by status
            return [
                ['role' => 'Total', 'workload' => 0, 'fill' => "hsl(var(--chart-1))"],
                ['role' => 'Pending', 'workload' => 0, 'fill' => "hsl(var(--chart-2))"],
                ['role' => 'Approved', 'workload' => 0, 'fill' => "hsl(var(--chart-3))"],
                ['role' => 'Disapproved', 'workload' => 0, 'fill' => "hsl(var(--chart-4))"],
            ];
        }
    }

    public function getServiceRequestCountPerMonthByStatus()
    {
        try {
            $query = ServiceRequest::whereYear('created_at', now()->year);
            
            // For staff and faculty users, only show their own service requests
            if (!$this->user->hasRole($this->allowedRoles)) {
                // Regular users (staff/faculty) - show only their requests
                $query->where('request_by', $this->user->username);
            }
            // For Admin, Principal, and Secretary, remove user filtering to show all requests
            // This will now show data for all users/employees in the system

            $rawData = $query->select('status', 'created_at')->get();

            $statuses = [
                "Pending" => "pending",
                "In Progress" => "inProgress",
                "Completed" => "completed",
                "Disapproved" => "rejected",
                "For Approval" => "forApproval",
            ];

            $grouped = $rawData->groupBy(function ($item) {
                return Carbon::parse($item->created_at)->format('F');
            })->map(function ($items, $month) use ($statuses) {
                $row = ['month' => $month];
                foreach ($statuses as $dbStatus => $camelKey) {
                    $row[$camelKey] = $items->where('status', $dbStatus)->count();
                }
                return $row;
            });

            $final = collect();
            for ($m = 1; $m <= now()->month; $m++) {
                $monthName = Carbon::create()->month($m)->format('F');
                $existing = $grouped->firstWhere('month', $monthName);
                $final->push($existing ?: array_merge(['month' => $monthName], array_fill_keys(array_values($statuses), 0)));
            }

            return $final->values();
        } catch (\Exception $e) {
            \Log::error('Service request count error: ' . $e->getMessage());
            return [];
        }
    }
}