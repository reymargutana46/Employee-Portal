<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Employee;
use App\Models\Leaves\Leave;
use Auth;
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

        // Prepare DTR data with proper date parsing for the new dtrecords table
        $dtrRecords = [];
        
        foreach ($records as $rec) {
            try {
                // Create date from month/year and day
                $date = Carbon::createFromFormat('F Y j', $monthYear . ' ' . $rec['day']);
                
                // Check if a record already exists for this employee and date
                $existingRecord = DB::table('dtrecords')
                    ->where('employee_id', $employee->id)
                    ->where('date', $date->format('Y-m-d'))
                    ->first();
                
                $recordData = [
                    'employee_id' => $employee->id,
                    'employee_name' => $employee->fname . ' ' . $employee->lname,
                    'date' => $date->format('Y-m-d'),
                    'am_time_in' => !empty($rec['am_arrival']) ? 
                        Carbon::createFromFormat('g:i a', $rec['am_arrival'])->format('H:i:s') : null,
                    'am_time_out' => !empty($rec['am_departure']) ? 
                        Carbon::createFromFormat('g:i a', $rec['am_departure'])->format('H:i:s') : null,
                    'pm_time_in' => !empty($rec['pm_arrival']) ? 
                        Carbon::createFromFormat('g:i a', $rec['pm_arrival'])->format('H:i:s') : null,
                    'pm_time_out' => !empty($rec['pm_departure']) ? 
                        Carbon::createFromFormat('g:i a', $rec['pm_departure'])->format('H:i:s') : null,
                ];
                
                if ($existingRecord) {
                    // Update existing record
                    $recordData['updated_at'] = now();
                    DB::table('dtrecords')
                        ->where('id', $existingRecord->id)
                        ->update($recordData);
                } else {
                    // Add new record
                    $recordData['created_at'] = now();
                    $recordData['updated_at'] = now();
                    $dtrRecords[] = $recordData;
                }
            } catch (\Exception $e) {
                // Handle parsing error - you could log this or return an error
                \Log::error("DTR parsing error for day {$rec['day']}: {$e->getMessage()}");
                continue;
            }
        }

        // Insert new records in batch
        if (!empty($dtrRecords)) {
            DB::table('dtrecords')->insert($dtrRecords);
        }

        ActivityLog::create([
            'performed_by' => Auth::user()->username,
            'action' => 'imported',
            'description' => "Imported DTR records for {$employee->fname} {$employee->lname}",
            'entity_type' => Employee::class,
            'entity_id' => $employee->id,
        ]);

        return response()->json([
            'status' => true,
            'message' => "created",
            'data' => $employee,
        ], 201);
    }

    public function checkForLeaveConflicts($employeeId)
    {
        $dtrConflicts = DB::table('dtrecords as d')
            ->join('leaves as l', 'd.employee_id', '=', 'l.employee_id')
            ->where('d.employee_id', $employeeId)
            ->where(function ($query) {
                $query->whereBetween(DB::raw('d.date'), [
                    DB::raw('DATE(l."from")'),
                    DB::raw('DATE(l."to")')
                ]);
            })
            ->select([
                'd.date',
                DB::raw('l."from" as leave_start'),
                DB::raw('l."to" as leave_end')
            ])
            ->get();
        return $dtrConflicts;
    }
}