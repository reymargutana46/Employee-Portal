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
        \Log::info("=== DTR BULK IMPORT START ===");
        
        $employeeName = $request->input('employee_name');
        $month = $request->input('month');
        $records = collect($request->input('records'));

        \Log::info("Employee Name: " . ($employeeName ?? 'NULL'));
        \Log::info("Month: " . ($month ?? 'NULL'));
        \Log::info("Records count: " . $records->count());
        \Log::info("Full request data: " . json_encode($request->all()));

        // Parse month and year properly
        $parts = explode(' ', trim($month));
        if (count($parts) == 1) {
            $monthYear = ucwords(strtolower($parts[0])) . ' ' . date('Y');
        } else {
            $monthYear = ucwords(strtolower(trim($month)));
        }
        \Log::info("Parsed month-year: " . $monthYear);

        $importedCount = 0;
        $skippedCount = 0;
        $dtrRecords = [];

        foreach ($records as $index => $rec) {
            \Log::info("=== Processing record #{$index} ===");
            \Log::info("Record data: " . json_encode($rec));
            
            $recordEmployeeId = $rec['employee_id'] ?? null;
            \Log::info("Employee ID: " . ($recordEmployeeId ?? 'NULL'));
            
            // Skip if no employee_id
            if (!$recordEmployeeId) {
                $skippedCount++;
                \Log::error("SKIPPING - No employee_id provided");
                continue;
            }
            
            // First, try to build the name from the CSV fields if they exist
            $csvName = trim(implode(' ', array_filter([
                $rec['fname'] ?? '',
                $rec['mname'] ?? '',
                $rec['lname'] ?? ''
            ], 'strlen')));

            if (!empty($csvName)) {
                $employeeName = $csvName;
                \Log::info("Using employee name from CSV fields: $employeeName");
                
                // Try to update the employees table with this name if the employee exists
                $employee = DB::table('employees')->where('id', $recordEmployeeId)->first();
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
                $employee = DB::table('employees')->where('id', $recordEmployeeId)->first();
                if ($employee) {
                    $employeeName = trim(implode(' ', array_filter([
                        $employee->fname ?? '',
                        $employee->mname ?? '',
                        $employee->lname ?? ''
                    ], 'strlen')));
                    \Log::info("Using employee name from database: $employeeName");
                } else {
                    // Last resort: use employee_id
                    $employeeName = "Employee ID: $recordEmployeeId";
                    \Log::warning("Employee ID {$recordEmployeeId} not found in database and no name provided in CSV");
                }
            }

            try {
                // Create date from month/year and day
                $date = Carbon::createFromFormat('F Y j', $monthYear . ' ' . $rec['day']);
                \Log::info("Created date: " . $date->format('Y-m-d'));
                
                // Check if record already exists
                $existingRecord = DB::table('dtrecords')
                    ->where('employee_id', $recordEmployeeId)
                    ->where('date', $date->format('Y-m-d'))
                    ->first();
                
                $recordData = [
                    'employee_name' => $employeeName,
                    'employee_id' => $recordEmployeeId,
                    'date' => $date->format('Y-m-d'),
                    'am_time_in' => null,
                    'am_time_out' => null,
                    'pm_time_in' => null,
                    'pm_time_out' => null,
                ];
                
                \Log::info("Processing times for record");
                
                // Parse time values - handle multiple formats
                if (!empty($rec['am_arrival'])) {
                    try {
                        $timeStr = trim($rec['am_arrival']);
                        
                        // Try different time formats
                        $formats = ['g:i a', 'G:i', 'H:i:s', 'H:i'];
                        $parsed = false;
                        
                        foreach ($formats as $format) {
                            try {
                                $recordData['am_time_in'] = Carbon::createFromFormat($format, $timeStr)->format('H:i:s');
                                \Log::info("AM time in parsed with format '{$format}': " . $recordData['am_time_in']);
                                $parsed = true;
                                break;
                            } catch (\Exception $e) {
                                continue;
                            }
                        }
                        
                        if (!$parsed) {
                            \Log::error("Failed to parse am_arrival with any format: " . $rec['am_arrival']);
                        }
                    } catch (\Exception $e) {
                        \Log::error("Failed to parse am_arrival: " . $rec['am_arrival'] . " - " . $e->getMessage());
                    }
                }
                
                if (!empty($rec['am_departure'])) {
                    try {
                        $timeStr = trim($rec['am_departure']);
                        $formats = ['g:i a', 'G:i', 'H:i:s', 'H:i'];
                        foreach ($formats as $format) {
                            try {
                                $recordData['am_time_out'] = Carbon::createFromFormat($format, $timeStr)->format('H:i:s');
                                \Log::info("AM time out: " . $recordData['am_time_out']);
                                break;
                            } catch (\Exception $e) {
                                continue;
                            }
                        }
                    } catch (\Exception $e) {
                        \Log::error("Failed to parse am_departure: " . $rec['am_departure']);
                    }
                }
                
                if (!empty($rec['pm_arrival'])) {
                    try {
                        $timeStr = trim($rec['pm_arrival']);
                        $formats = ['g:i a', 'G:i', 'H:i:s', 'H:i'];
                        foreach ($formats as $format) {
                            try {
                                $recordData['pm_time_in'] = Carbon::createFromFormat($format, $timeStr)->format('H:i:s');
                                \Log::info("PM time in: " . $recordData['pm_time_in']);
                                break;
                            } catch (\Exception $e) {
                                continue;
                            }
                        }
                    } catch (\Exception $e) {
                        \Log::error("Failed to parse pm_arrival: " . $rec['pm_arrival']);
                    }
                }
                
                if (!empty($rec['pm_departure'])) {
                    try {
                        $timeStr = trim($rec['pm_departure']);
                        $formats = ['g:i a', 'G:i', 'H:i:s', 'H:i'];
                        foreach ($formats as $format) {
                            try {
                                $recordData['pm_time_out'] = Carbon::createFromFormat($format, $timeStr)->format('H:i:s');
                                \Log::info("PM time out: " . $recordData['pm_time_out']);
                                break;
                            } catch (\Exception $e) {
                                continue;
                            }
                        }
                    } catch (\Exception $e) {
                        \Log::error("Failed to parse pm_departure: " . $rec['pm_departure']);
                    }
                }
                
                if ($existingRecord) {
                    \Log::info("Updating existing record ID: " . $existingRecord->id);
                    $recordData['updated_at'] = now();
                    DB::table('dtrecords')
                        ->where('id', $existingRecord->id)
                        ->update($recordData);
                    $importedCount++;
                } else {
                    \Log::info("Adding new record to batch");
                    $recordData['created_at'] = now();
                    $recordData['updated_at'] = now();
                    $dtrRecords[] = $recordData;
                    $importedCount++;
                }
                
            } catch (\Exception $e) {
                \Log::error("Error processing record: " . $e->getMessage());
                $skippedCount++;
                continue;
            }
        }

        // Insert new records in batch
        if (!empty($dtrRecords)) {
            \Log::info("Inserting " . count($dtrRecords) . " DTR records");
            \Log::info("Sample record: " . json_encode($dtrRecords[0]));
            DB::table('dtrecords')->insert($dtrRecords);
            \Log::info("Insert completed");
        } else {
            \Log::info("No new records to insert");
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