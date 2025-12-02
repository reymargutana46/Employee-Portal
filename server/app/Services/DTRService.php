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
    public function bulkStore($request): JsonResponse
    {
        // \Log::info("=== DTR BULK IMPORT START ==="); // Comment out for performance
        
        $employeeName = $request->input('employee_name');
        $month = $request->input('month');
        $records = collect($request->input('records'));

        // \Log::info("Employee Name: " . ($employeeName ?? 'NULL')); // Comment out for performance
        // \Log::info("Month: " . ($month ?? 'NULL')); // Comment out for performance
        // \Log::info("Records count: " . $records->count()); // Comment out for performance
        // \Log::info("Full request data: " . json_encode($request->all())); // Comment out for performance

        // Parse month and year properly
        $parts = explode(' ', trim($month));
        if (count($parts) == 1) {
            $monthYear = ucwords(strtolower($parts[0])) . ' ' . date('Y');
        } else {
            $monthYear = ucwords(strtolower(trim($month)));
        }
        // \Log::info("Parsed month-year: " . $monthYear); // Comment out for performance

        $importedCount = 0;
        $skippedCount = 0;
        $dtrRecords = [];

        // Pre-fetch all employee data for better performance
        $employeeIds = $records->pluck('employee_id')->filter()->unique()->toArray();
        $employees = collect();
        if (!empty($employeeIds)) {
            $employees = DB::table('employees')->whereIn('id', $employeeIds)->get()->keyBy('id');
        }

        // Pre-fetch existing DTR records for the month to avoid duplicate queries
        $existingRecords = collect();
        if (!empty($employeeIds)) {
            // Extract year from monthYear
            $dateParts = explode(' ', $monthYear);
            if (count($dateParts) >= 2) {
                $year = $dateParts[1];
                $monthNum = date('m', strtotime($dateParts[0]));
                $startDate = "$year-$monthNum-01";
                $endDate = date('Y-m-t', strtotime($startDate));
                
                $existingDbRecords = DB::table('dtrecords')
                    ->whereIn('employee_id', $employeeIds)
                    ->whereBetween('date', [$startDate, $endDate])
                    ->get();
                
                // Key by employee_id_date for fast lookup
                foreach ($existingDbRecords as $record) {
                    $key = $record->employee_id . '_' . $record->date;
                    $existingRecords[$key] = $record;
                }
            }
        }

        foreach ($records as $index => $rec) {
            // \Log::info("=== Processing record #{$index} ==="); // Comment out for performance
            // \Log::info("Record data: " . json_encode($rec)); // Comment out for performance
            
            $recordEmployeeId = $rec['employee_id'] ?? null;
            // \Log::info("Employee ID: " . ($recordEmployeeId ?? 'NULL')); // Comment out for performance
            
            // Skip if no employee_id
            if (!$recordEmployeeId) {
                $skippedCount++;
                // \Log::error("SKIPPING - No employee_id provided"); // Comment out for performance
                continue;
            }
            
            // Get employee data from pre-fetched collection
            $employee = $employees->get($recordEmployeeId);
            
            // First, try to build the name from the CSV fields if they exist
            $csvName = trim(implode(' ', array_filter([
                $rec['fname'] ?? '',
                $rec['mname'] ?? '',
                $rec['lname'] ?? ''
            ], 'strlen')));

            if (!empty($csvName)) {
                $employeeName = $csvName;
                // \Log::info("Using employee name from CSV fields: $employeeName"); // Comment out for performance
                
                // Only update if employee exists and names are different
                if ($employee) {
                    // Check if the name in the database is different
                    $dbName = trim(implode(' ', array_filter([
                        $employee->fname ?? '',
                        $employee->mname ?? '',
                        $employee->lname ?? ''
                    ], 'strlen')));
                    
                    if (strcasecmp($dbName, $csvName) !== 0) {
                        // Update the employee's name in the database
                        DB::table('employees')
                            ->where('id', $recordEmployeeId)
                            ->update([
                                'fname' => $rec['fname'] ?? $employee->fname,
                                'mname' => $rec['mname'] ?? $employee->mname,
                                'lname' => $rec['lname'] ?? $employee->lname,
                                'updated_at' => now()
                            ]);
                    }
                }
            } else {
                // Fall back to database lookup if CSV name fields are empty
                if ($employee) {
                    $employeeName = trim(implode(' ', array_filter([
                        $employee->fname ?? '',
                        $employee->mname ?? '',
                        $employee->lname ?? ''
                    ], 'strlen')));
                    // \Log::info("Using employee name from database: $employeeName"); // Comment out for performance
                } else {
                    // Last resort: use employee_id
                    $employeeName = "Employee ID: $recordEmployeeId";
                    // \Log::warning("Employee ID {$recordEmployeeId} not found in database and no name provided in CSV"); // Comment out for performance
                }
            }

            try {
                // Create date from month/year and day
                $date = Carbon::createFromFormat('F Y j', $monthYear . ' ' . $rec['day']);
                // \Log::info("Created date: " . $date->format('Y-m-d')); // Comment out for performance
                
                // Check if record already exists using pre-fetched data
                $dateKey = $recordEmployeeId . '_' . $date->format('Y-m-d');
                $existingRecord = $existingRecords->get($dateKey);
                
                $recordData = [
                    'employee_name' => $employeeName,
                    'employee_id' => $recordEmployeeId,
                    'date' => $date->format('Y-m-d'),
                    'am_time_in' => null,
                    'am_time_out' => null,
                    'pm_time_in' => null,
                    'pm_time_out' => null,
                ];
                
                // \Log::info("Processing times for record"); // Comment out for performance
                
                // Parse time values - handle multiple formats (optimized)
                if (!empty($rec['am_arrival'])) {
                    $recordData['am_time_in'] = $this->parseTimeValue($rec['am_arrival']);
                }
                
                if (!empty($rec['am_departure'])) {
                    $recordData['am_time_out'] = $this->parseTimeValue($rec['am_departure']);
                }
                
                if (!empty($rec['pm_arrival'])) {
                    $recordData['pm_time_in'] = $this->parseTimeValue($rec['pm_arrival']);
                }
                
                if (!empty($rec['pm_departure'])) {
                    $recordData['pm_time_out'] = $this->parseTimeValue($rec['pm_departure']);
                }
                
                if ($existingRecord) {
                    // \Log::info("Updating existing record ID: " . $existingRecord->id); // Comment out for performance
                    $recordData['updated_at'] = now();
                    DB::table('dtrecords')
                        ->where('id', $existingRecord->id)
                        ->update($recordData);
                    $importedCount++;
                } else {
                    // \Log::info("Adding new record to batch"); // Comment out for performance
                    $recordData['created_at'] = now();
                    $recordData['updated_at'] = now();
                    $dtrRecords[] = $recordData;
                    $importedCount++;
                }
                
            } catch (\Exception $e) {
                // \Log::error("Error processing record: " . $e->getMessage()); // Comment out for performance
                $skippedCount++;
                continue;
            }
        }

        // Insert new records in batch
        if (!empty($dtrRecords)) {
            // \Log::info("Inserting " . count($dtrRecords) . " DTR records"); // Comment out for performance
            // \Log::info("Sample record: " . json_encode($dtrRecords[0])); // Comment out for performance
            DB::table('dtrecords')->insert($dtrRecords);
            // \Log::info("Insert completed"); // Comment out for performance
        } else {
            // \Log::info("No new records to insert"); // Comment out for performance
        }

        // Only create activity log if user is authenticated
        if (Auth::user()) {
            ActivityLog::create([
                'performed_by' => Auth::user()->username,
                'action' => 'imported',
                'description' => "Imported DTR records for {$employeeName}",
                'entity_type' => 'dtrecords',
                'entity_id' => 0,
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => "DTR records imported successfully",
            'data' => [
                'imported_count' => $importedCount,
                'skipped_count' => $skippedCount,
                'total_records' => $records->count(),
            ],
        ], 201);
    }

    /**
     * Optimized time parsing function
     */
    private function parseTimeValue($timeStr)
    {
        if (empty($timeStr)) {
            return null;
        }
        
        $timeStr = trim($timeStr);
        
        // Try different time formats
        $formats = ['g:i a', 'G:i', 'H:i:s', 'H:i'];
        foreach ($formats as $format) {
            try {
                return Carbon::createFromFormat($format, $timeStr)->format('H:i:s');
            } catch (\Exception $e) {
                continue;
            }
        }
        
        // If all formats fail, return null
        return null;
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