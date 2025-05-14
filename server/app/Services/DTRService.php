<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Leaves\Leave;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DTRService
{

    protected EmployeeService $employeeService;
    /**
     * Create a new class instance.
     */
    public function __construct(EmployeeService $employeeService)
    {
        $this->employeeService = $employeeService;
    }
    public function bulkStore($data): JsonResponse
    {
        $employee = $this->employeeService->fetchByFullname($data->employee_name);
        // Parse month and year properly
        $parts = explode(' ', trim($data->month));
        if (count($parts) == 1) {
            // If only month is provided, add the current year
            $monthYear = ucwords(strtolower($parts[0])) . ' ' . date('Y');
        } else {
            $monthYear = ucwords(strtolower(trim($data->month)));
        }
        if (!$employee) {
            return response()->json([
                'status' => false,
                'message' => "Employee " . $data->employee_name . ' not found',
            ], 404);
        }

        $records = collect($data->records);

        $conflictingLeaves = $this->checkForLeaveConflicts($employee->id);

        if ($conflictingLeaves->isNotEmpty()) {
            $conflictDates = $conflictingLeaves
                ->map(function ($leave) {
                    return [
                        'start' => Carbon::parse($leave->leave_start)->toDateString(),
                        'end' => Carbon::parse($leave->leave_end)->toDateString(),
                    ];
                })
                ->unique() // Remove duplicate ranges
                ->map(function ($range) {
                    $startDate = Carbon::parse($range['start'])->format('F j, Y');
                    $endDate = Carbon::parse($range['end'])->format('F j, Y');
                    return $startDate . ($startDate !== $endDate ? " to " . $endDate : "");
                })
                ->implode(', ');


            return response()->json([

                'message' => "The employee has approved leaves on: " . $conflictDates

            ], 422);
        }

        // Prepare AM and PM data with proper date parsing
        $amRecords = $records->map(function ($rec) use ($monthYear) {
            try {
                return [
                    'time_in' => !empty($rec['am_arrival']) ?
                        Carbon::createFromFormat('F Y j g:i a', $monthYear . ' ' . $rec['day'] . ' ' . $rec['am_arrival']) : null,
                    'time_out' => !empty($rec['am_departure']) ?
                        Carbon::createFromFormat('F Y j g:i a', $monthYear . ' ' . $rec['day'] . ' ' . $rec['am_departure']) : null,
                ];
            } catch (\Exception $e) {
                // Handle parsing error - you could log this or return an error
                return [
                    'time_in' => null,
                    'time_out' => null,
                    'error' => "Unable to parse date for day {$rec['day']}: {$e->getMessage()}"
                ];
            }
        })->filter(function ($record) {
            // Filter out records with parsing errors
            return !isset($record['error']);
        })->toArray();

        $pmRecords = $records->map(function ($rec) use ($monthYear) {
            try {
                return [
                    'time_in' => !empty($rec['pm_arrival']) ?
                        Carbon::createFromFormat('F Y j g:i a', $monthYear . ' ' . $rec['day'] . ' ' . $rec['pm_arrival']) : null,
                    'time_out' => !empty($rec['pm_departure']) ?
                        Carbon::createFromFormat('F Y j g:i a', $monthYear . ' ' . $rec['day'] . ' ' . $rec['pm_departure']) : null,
                ];
            } catch (\Exception $e) {
                // Handle parsing error
                return [
                    'time_in' => null,
                    'time_out' => null,
                    'error' => "Unable to parse date for day {$rec['day']}: {$e->getMessage()}"
                ];
            }
        })->filter(function ($record) {
            // Filter out records with parsing errors
            return !isset($record['error']);
        })->toArray();

        // Filter out null entries
        $amRecords = array_filter($amRecords, function ($record) {
            return !is_null($record['time_in']) || !is_null($record['time_out']);
        });

        $pmRecords = array_filter($pmRecords, function ($record) {
            return !is_null($record['time_in']) || !is_null($record['time_out']);
        });
        DB::transaction(function () use ($employee, $amRecords, $pmRecords) {
            if (!empty($amRecords)) {
                $employee->DTRAmTimes()->createMany($amRecords);
            }

            if (!empty($pmRecords)) {
                $employee->DTRPmTimes()->createMany($pmRecords);
            }
        },2);
        // Save the records to database


        return response()->json([
            'status' => true,
            'message' => "created",
            'data' => $employee,
        ], 201);
    }

    public function checkForLeaveConflicts($employeeId)
    {
        $amConflicts = DB::table('dtr_amtimes as d')
            ->join('leaves as l', 'd.employee_id', '=', 'l.employee_id')
            ->where('d.employee_id', $employeeId)
            ->where(function ($query) {
                $query->whereBetween(DB::raw('DATE(d.time_in)'), [
                    DB::raw('DATE(l."from")'),
                    DB::raw('DATE(l."to")')
                ])
                    ->orWhereBetween(DB::raw('DATE(d.time_out)'), [
                        DB::raw('DATE(l."from")'),
                        DB::raw('DATE(l."to")')
                    ]);
            })
            ->select([
                'd.time_in',
                DB::raw('l."from" as leave_start'),
                DB::raw('l."to" as leave_end')
            ])
            ->get();
        return $amConflicts;
    }
}
