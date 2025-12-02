<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use App\Models\Leaves\Leave;
use App\Models\Leaves\LeaveType;
use Carbon\Carbon;
use DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Str;

class LeaveController extends Controller
{
    public function index()
    {
        $leave = Leave::with(['leaveRejection', 'employee', 'leaveType'])
            ->when(!Auth::user()->hasRole(['Principal', 'Admin', 'Secretary']), function ($query) {
                return $query->where('employee_id', Auth::user()->employee->id);
            })->get();

        return $this->ok($leave);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type'   => 'required',
            'from'   => ['required', 'date'],
            'to'     => ['required', 'date'],
            'reason' => ['required', 'string', 'min:15'],
        ]);

        // Optimize leave type lookup
        $typeName = trim($request->type);
        // First try exact match (most common case)
        $type = LeaveType::where('name', $typeName)->first();

        // If not found, try case-insensitive search as fallback
        if (!$type) {
            $type = LeaveType::whereRaw('LOWER(name) = LOWER(?)', [$typeName])->first();
        }

        if (!$type) {
            // Log what types are available for debugging
            $availableTypes = LeaveType::pluck('name')->toArray();
            \Log::info('Leave type not found: ' . $typeName . '. Available types: ' . implode(', ', $availableTypes));
            return $this->notFound('Type "' . $typeName . '" is not found. Available types: ' . implode(', ', $availableTypes));
        }

        $employee = Auth::user()->employee;
        $fromDate = Carbon::parse($request->from)->startOfDay();
        $toDate = Carbon::parse($request->to)->startOfDay();

        $leave = Leave::create([
            'status'      => 'Pending',
            'type_id'     => $type->id,
            'from'        => $fromDate,
            'to'          => $toDate,
            'reason'      => $request->reason,
            'employee_id' => $employee->id
        ]);

        $data = [
            'status' => 'Pending',
            'type_id' => $type->id,
            'from' => $fromDate->format('Y-m-d'),
            'to' => $toDate->format('Y-m-d'),
            'reason' => $request->reason,
            'employee' => $employee,
            'leave_rejection' => null,
            'leave_type' => $type
        ];

        ActivityLog::create([
            'performed_by' => Auth::user()->username,
            'action' => 'created',
            'description' => "Send leave {$employee->fname} {$employee->lname}",
            'entity_type' => Leave::class,
            'entity_id' => $leave->id,
        ]);

        return $this->created($data);
    }

    public function decision(Request $request): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:Approved,Disapproved',
            'reason' => 'required_if:status,Disapproved|string|nullable',
            'id' => 'required|exists:leaves,id',
        ]);
        return  DB::transaction(function () use ($request) {


            $leave = Leave::findOrFail($request->id);

            if ($leave->status !== 'Pending') {
                return $this->badRequest("Leave is already updated.");
            }

            $status = Str::lower($request->status);

            if ($status === 'approved') {
                $leave->status = 'Approved';
                $leave->save();
                ActivityLog::create([
                    'performed_by' => Auth::user()->username,
                    'action' => 'approved',
                    'description' => "Approved leave {$leave->employee->fname} {$leave->employee->lname}",
                    'entity_type' => Leave::class,
                    'entity_id' => $leave->id,
                ]);
                return $this->ok($leave, "Leave Approved");
            }

            // If disapproved
            $leave->status = 'Disapproved';
            $leave->save();

            // Create the leave rejection
            $leave->leaveRejection()->create([
                'rejected_by' => Auth::user()->username,
                'rejreason' => $request->reason
            ]);
            ActivityLog::create([
                'performed_by' => Auth::user()->username,
                'action' => 'disapprove',
                'description' => "Disapproved leave {$leave->employee->fname} {$leave->employee->lname}",
                'entity_type' => Leave::class,
                'entity_id' => $leave->id,
            ]);

            return $this->ok($leave, "Leave Disapproved");
        });
    }
    
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'type' => 'required',
            'from' => 'required|date',
            'to' => 'required|date',
            'reason' => 'required|string|min:15'
        ]);

        // Log the incoming request data
        \Log::info('Leave update request data: ', $request->all());

        // Check if user is authorized to update this leave
        $leave = Leave::findOrFail($id);
        
        // Only the owner of the leave request can edit it
        if (Auth::user()->employee->id !== $leave->employee_id) {
            return $this->unauthorized("You are not authorized to edit this leave request.");
        }

        // Check if leave is still pending
        if ($leave->status !== "Pending") {
            return $this->badRequest("Leave is already Updated");
        }

        // Optimize leave type lookup
        $typeName = trim($request->type);
        // First try exact match (most common case)
        $type = LeaveType::where('name', $typeName)->first();

        // If not found, try case-insensitive search as fallback
        if (!$type) {
            $type = LeaveType::whereRaw('LOWER(name) = LOWER(?)', [$typeName])->first();
        }

        if (!$type) {
            // Log what types are available for debugging
            $availableTypes = LeaveType::pluck('name')->toArray();
            \Log::info('Leave type not found during update: ' . $typeName . '. Available types: ' . implode(', ', $availableTypes));
            return $this->notFound('Type "' . $typeName . '" is not found. Available types: ' . implode(', ', $availableTypes));
        }
        
        \Log::info('Leave before update: ', $leave->toArray());
        
        $fromDate = Carbon::parse($request->from)->startOfDay();
        $toDate = Carbon::parse($request->to)->startOfDay();
        
        $leave->type_id = $type->id;
        $leave->reason = $request->reason;
        $leave->from = $fromDate;
        $leave->to = $toDate;
        $leave->save();
        
        \Log::info('Leave after update: ', $leave->fresh()->toArray());

        return $this->ok($leave->fresh());
    }

    public function leaveTypes()
    {
        $types = LeaveType::all();
        return $this->ok($types);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $leave = Leave::with('leaveRejection')->findOrFail($id);
        return $this->ok($leave);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $leave = Leave::findOrFail($id);
        if ($leave->status != "Pending") {
            return $this->badRequest("you cannot delete leave that is already " . $leave->status);
        }
        $leave->delete();
        return $this->ok();
    }
}