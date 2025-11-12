<?php

namespace App\Http\Controllers;

use App\Http\Requests\BulkDtrRequest;
use App\Models\ActivityLog;
use App\Models\DtrAmtime;
use App\Models\DTRPmtime;
use App\Models\Employee;
use App\Models\Leaves\Leave;
use App\Services\DTRService;
use App\Services\EmployeeService;
use Auth;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;
use Str;

class DTRController extends Controller
{

    protected $dtrService;
    protected $employeeService;
    protected $hasAccess;
    public function __construct(DTRService $dtrService, EmployeeService $employeeService)
    {
        $this->dtrService = $dtrService;
        $this->employeeService = $employeeService;
        $this->hasAccess = Auth::user()->hasRole(['Secretary', 'Admin', 'Principal']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = ['Secretary', 'Admin'];
        $user = Auth::user();


        // Get all DTR entries from the new dtrecords table
        $dtrEntries = DB::table('dtrecords')
            ->when(!$this->hasAccess, function ($query) use ($user) {
                return $query->where('employee_id', $user->employee->id);
            })
            ->select([
                'date',
                'am_time_in',
                'am_time_out',
                'pm_time_in',
                'pm_time_out',
                'id as dtr_id',
                'employee_id',
            ])
            ->get();

        // Get all leave entries with date range information
        $leavesRaw = DB::table('leaves')
            ->join('leave_types', 'leave_types.id', '=', 'leaves.type_id')
            ->when(!$this->hasAccess, function ($query) use ($user) {
                return $query->where('employee_id', $user->employee->id);
            })
            ->select([
                'leaves.from',
                'leaves.to',
                'leave_types.name',
                'leaves.id as leave_id',
                'leaves.employee_id',
            ])
            ->get();

        // Process leave entries for all days in the range (from->to)
        $leaveEntries = collect();
        foreach ($leavesRaw as $leave) {
            $fromDate = Carbon::parse($leave->from);
            $toDate = Carbon::parse($leave->to);

            // Generate entries for each day in the leave range
            for ($date = clone $fromDate; $date->lte($toDate); $date->addDay()) {
                $leaveEntries->push((object)[
                    'date' => $date->format('Y-m-d'),
                    'name' => $leave->name,
                    'leave_id' => $leave->leave_id,
                    'employee_id' => $leave->employee_id,
                ]);
            }
        }

        // Combine all unique dates
        $dates = $dtrEntries->pluck('date')
            ->merge($leaveEntries->pluck('date'))
            ->unique()
            ->sort();

        $allEmployees = $this->hasAccess
            ? DB::table('employees')->get()->keyBy('id')
            : collect([$user->employee])->keyBy('id');

        // Compile final records
        $records = [];
        foreach ($dates as $date) {
            // Get all involved employee IDs for this date
            $employeeIds = collect()
                ->merge($dtrEntries->where('date', $date)->pluck('employee_id'))
                ->merge($leaveEntries->where('date', $date)->pluck('employee_id'))
                ->unique();

            foreach ($employeeIds as $employeeId) {
                $dtrEntry = $dtrEntries->where('date', $date)->where('employee_id', $employeeId)->first();
                $leaveExist = $leaveEntries->where('date', $date)->where('employee_id', $employeeId)->first();

                $amArrival = $dtrEntry && $dtrEntry->am_time_in ? Carbon::parse($dtrEntry->am_time_in)->format('g:i A') : null;
                $amDeparture = $dtrEntry && $dtrEntry->am_time_out ? Carbon::parse($dtrEntry->am_time_out)->format('g:i A') : null;
                $pmArrival = $dtrEntry && $dtrEntry->pm_time_in ? Carbon::parse($dtrEntry->pm_time_in)->format('g:i A') : null;
                $pmDeparture = $dtrEntry && $dtrEntry->pm_time_out ? Carbon::parse($dtrEntry->pm_time_out)->format('g:i A') : null;

                $status = $leaveExist ? 'Leave' : ($dtrEntry ? 'Present' : 'Absent');

                $employee = $allEmployees->get($employeeId);
                $fullname = $employee->extname
                    ? $employee->extname . ' ' . $employee->fname . ' ' . $employee->lname
                    : $employee->fname . ' ' . $employee->lname;

                $records[] = [
                    'employee_id' => $employeeId,
                    'dtr_id' => $dtrEntry?->dtr_id,
                    'leave_id' => $leaveExist?->leave_id,
                    'employee' => $fullname,
                    'date' => Carbon::parse($date)->format('M d, Y'),
                    'am_arrival' => $amArrival,
                    'am_departure' => $amDeparture,
                    'pm_arrival' => $pmArrival,
                    'pm_departure' => $pmDeparture,
                    'status' => $status,
                    'type' => $leaveExist?->name,
                ];
            }
        }

        return $this->ok($records);
    }


    /**
     * Store a newly created resource in storage.
     * manual input
     */
    public function store(Request $request)
    {
        $request->validate([
            'amArrival' => ['required', 'string'],
            'amDeparture' => ['required', 'string'],
            'date' => ['required', 'string'],
            'employee' => ['required', 'string'],
            'pmArrival' => ['required', 'string'],
            'pmDeparture' => ['required', 'string'],

        ]);

        $employee = $this->employeeService->fetchByFullname($request->employee);

        if (!$employee) {
            return $this->notFound("Employee " . $request->employee . ' not found');
        }
        $date = $request->date;
        $conflict = Leave::where('employee_id', $employee->id)
            ->where(function ($query) use ($date) {
                $query->where('from', '<=', $date)
                    ->where('to', '>=', $date);
            })->exists();

        if ($conflict) {
            return response()->json([

                'message' => "The employee has approved leaves on: " . $date,

            ], 422);
        }

        // Create a single record in the new dtrecords table
        try {
            DB::transaction(function () use ($employee, $request) {
                $date = Carbon::createFromFormat('Y-m-d', $request->date);
                
                // Check if a record already exists for this employee and date
                $existingRecord = DB::table('dtrecords')
                    ->where('employee_id', $employee->id)
                    ->where('date', $date->format('Y-m-d'))
                    ->first();
                
                if ($existingRecord) {
                    // Update existing record
                    DB::table('dtrecords')
                        ->where('id', $existingRecord->id)
                        ->update([
                            'am_time_in' => !empty($request->amArrival) ? 
                                Carbon::createFromFormat('Y-m-d H:i', $request->date . ' ' . $request->amArrival)->format('H:i:s') : null,
                            'am_time_out' => !empty($request->amDeparture) ? 
                                Carbon::createFromFormat('Y-m-d H:i', $request->date . ' ' . $request->amDeparture)->format('H:i:s') : null,
                            'pm_time_in' => !empty($request->pmArrival) ? 
                                Carbon::createFromFormat('Y-m-d H:i', $request->date . ' ' . $request->pmArrival)->format('H:i:s') : null,
                            'pm_time_out' => !empty($request->pmDeparture) ? 
                                Carbon::createFromFormat('Y-m-d H:i', $request->date . ' ' . $request->pmDeparture)->format('H:i:s') : null,
                            'updated_at' => now(),
                        ]);
                } else {
                    // Create new record
                    DB::table('dtrecords')->insert([
                        'employee_id' => $employee->id,
                        'employee_name' => $employee->fname . ' ' . $employee->lname,
                        'date' => $date->format('Y-m-d'),
                        'am_time_in' => !empty($request->amArrival) ? 
                            Carbon::createFromFormat('Y-m-d H:i', $request->date . ' ' . $request->amArrival)->format('H:i:s') : null,
                        'am_time_out' => !empty($request->amDeparture) ? 
                            Carbon::createFromFormat('Y-m-d H:i', $request->date . ' ' . $request->amDeparture)->format('H:i:s') : null,
                        'pm_time_in' => !empty($request->pmArrival) ? 
                            Carbon::createFromFormat('Y-m-d H:i', $request->date . ' ' . $request->pmArrival)->format('H:i:s') : null,
                        'pm_time_out' => !empty($request->pmDeparture) ? 
                            Carbon::createFromFormat('Y-m-d H:i', $request->date . ' ' . $request->pmDeparture)->format('H:i:s') : null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                ActivityLog::create([
                    'performed_by' => Auth::user()->username,
                    'action' => 'created',
                    'description' => "Created DTR for {$employee->fname} {$employee->lname}",
                    'entity_type' => Employee::class,
                    'entity_id' => $employee->id,
                ]);
            }, 2);
        } catch (\Throwable $th) {
            return $this->serverError($th->getMessage());
        }

        return $this->created($employee);
    }

    /**
     * Store a newly created resource in storage.
     * import input
     */
    public function bulkStore(BulkDtrRequest $request)
    {
        $request->validated();
        return $this->dtrService->bulkStore($request);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $data = $request->validate([
            'employee' => 'required|string|max:255',
            'date' => 'required|date',
            'am_arrival' => 'required',
            'am_departure' => 'required',
            'pm_arrival' => 'required',
            'pm_departure' => 'required',
            'dtr_id' => 'nullable|integer|exists:dtrecords,id|required_without:leave_id',
            'leave_id' => 'nullable|integer|exists:leaves,id|required_without_all:dtr_id',
            'employee_id' => 'required|integer|exists:employees,id',
            'status' => 'required|string|in:Present,Leave,Absent',
            'type' => 'nullable|string|max:255',
        ]);


        DB::transaction(function () use ($data) {
            // Parse full datetime from date + time strings
            $amTimeIn = !empty($data['am_arrival']) ? Carbon::parse($data['date'] . ' ' . $data['am_arrival']) : null;
            $amTimeOut = !empty($data['am_departure']) ? Carbon::parse($data['date'] . ' ' . $data['am_departure']) : null;
            $pmTimeIn = !empty($data['pm_arrival']) ? Carbon::parse($data['date'] . ' ' . $data['pm_arrival']) : null;
            $pmTimeOut = !empty($data['pm_departure']) ? Carbon::parse($data['date'] . ' ' . $data['pm_departure']) : null;

            if ($data['dtr_id']) {
                // Update DTR record
                DB::table('dtrecords')->where('id', $data['dtr_id'])->update([
                    'am_time_in' => $amTimeIn ? $amTimeIn->format('H:i:s') : null,
                    'am_time_out' => $amTimeOut ? $amTimeOut->format('H:i:s') : null,
                    'pm_time_in' => $pmTimeIn ? $pmTimeIn->format('H:i:s') : null,
                    'pm_time_out' => $pmTimeOut ? $pmTimeOut->format('H:i:s') : null,
                    'updated_at' => now(),
                ]);
            }

            // Update Leave if present
            if ($data['leave_id']) {
                Leave::where('id', $data['leave_id'])->update([
                    'employee_id' => $data['employee_id'],
                    'type' => $data['type'],
                ]);
            }
            ActivityLog::create([
                'performed_by' => Auth::user()->username,
                'action' => 'updated',
                'description' => "Updated DTR for {$data['employee']}",
                'entity_type' => Employee::class,
                'entity_id' => $data['employee_id'],
            ]);
        });

        return $this->ok();

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}