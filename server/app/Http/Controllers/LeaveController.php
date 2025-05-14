<?php

namespace App\Http\Controllers;

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
    /**
     * Display a listing of the resource.
     */
    public function index()
    {


        $hasAccess = Auth::user()->hasRole(["Principal", "Admin"]);
        if($hasAccess){
            $leaves = Leave::with(['leaveRejection', 'employee','leaveType' ])->get();

            return $this->ok($leaves);
        }
        $leave = Leave::with(['leaveRejection', 'employee','leaveType' ])
        ->where('employee_id', Auth::user()->employee->id )->get();
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

        $type = LeaveType::where('name', $request->type)->first();

        if (!$type) {
            return $this->notFound('Type ' . $request->type . ' is not found');
        }

        $employee = Auth::user()->employee;
        $fromDate = Carbon::parse($request->from)->startOfDay();
        $toDate = Carbon::parse($request->to)->startOfDay();

     Leave::create([
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

        return $this->created($data);
    }

    public function decision(Request $request): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:Approved,Rejected',
            'reason' => 'required_if:status,rejected|string|nullable',
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
                return $this->ok($leave, "Leave Approved");
            }

            // If rejected
            $leave->status = 'Rejected';
            $leave->save();

            // Create the leave rejection
            $leave->leaveRejection()->create([
                'rejected_by' => Auth::user()->username,
                'rejreason' => $request->reason
            ]);

            return $this->ok($leave, "Leave Rejected");
        });
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
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'type' => 'required',
            'from' => 'required|date',
            'to' => 'required|date',
            'reason' => 'required'
        ]);

        $type = LeaveType::where('name', $request->type)->firstOrFail();
        $leave = Leave::findOrFail($id);
        if($leave->status !== "Pending")
        {
            return $this->badRequest("Leave is already Updated");
        }
        $leave->type_id = $type->id;
        $leave->reason = $request->reason;
        $leave->save();

        return $this->ok();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $leave = Leave::findOrFail($id);
        if($leave->status != "Pending"){
            return $this->badRequest("you cannot delete leave that is already " . $leave->status);
        }
        $leave->delete();
        return $this->ok();
    }
}
