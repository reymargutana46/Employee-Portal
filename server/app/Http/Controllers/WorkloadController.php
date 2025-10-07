<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Employee;
use App\Models\Notification;
use App\Models\FacultyWL;
use App\Models\Room;
use App\Models\StaffWL;
use App\Models\User;
use App\Models\WorkLoadHdr;
use DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WorkloadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Eager load both facultyWL.room and staffWL.room from the start
        $allWorkloads = WorkLoadHdr::with([
            'facultyWL.room',
            'staffWL',
            'employee'
        ])->get();

        // Separate workloads into faculty and staff collections
        $facultyWorkload = $allWorkloads->where('type', 'FACULTY')->where('assignee_id', '!=', null);
        $staffWorkload = $allWorkloads->where('type', 'STAFF')->where('assignee_id', '!=', null);
        $unassignedWorkload = $allWorkloads->where('assignee_id', null);

        // Return both collections in a structured response
        return $this->ok([
            'facultyWorkload' => $facultyWorkload->values(),
            'staffWorkload' => $staffWorkload->values(),
            'unassignedWorkload' => $unassignedWorkload->values()
        ]);
    }
    /**
     * Store a newly created Workload in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
            'type' => 'required|string',
        ]);

        $workload = WorkLoadHdr::create([
            'title' => $validated['title'],
            'created_by' => Auth::user()->username,
            'type' => $validated['type'],
            'to' => $validated['to'],
            'from' => $validated['from'],
            'status' => 'PENDING',
        ]);

        ActivityLog::create([
            'performed_by' => Auth::user()->username,
            'action' => 'create',
            'description' => "Created a new workload {$workload->title}",
            'entity_type' => WorkLoadHdr::class,
            'entity_id' => $workload->id,
        ]);
        return $this->created($workload);
    }




    public function assignStaff(Request $request)
    {
        $validated = $request->validate([
            'assignee_id' => 'required|exists:employees,id',
            'description' => 'nullable|string',
            'schedFrom' => 'required|date',
            'schedTo' => 'required|date|after_or_equal:schedFrom',
            'title' => 'required|string|max:255',
            'workload_id' => 'required|exists:work_load_hdrs,id',

        ]);

        $data = DB::transaction(function () use ($validated) {
            $workload = WorkLoadHdr::findOrFail($validated['workload_id']);
            $workload->update([
                'assignee_id' => $validated['assignee_id'],
            ]);

            $staff = StaffWL::create([
                'description' => $validated['description'],
                'sched_from' => $validated['schedFrom'],
                'sched_to' => $validated['schedTo'],
                'title' => $validated['title'],
                'workload_id' => $workload->id,
            ]);
            ActivityLog::create([
                'performed_by' => Auth::user()->username,
                'action' => 'assigned',
                'description' => "Workload {$workload->title} Assigned to {$workload->employee->fname} {$workload->employee->lname}",
                'entity_type' => StaffWL::class,
                'entity_id' => $staff->id,
            ]);
            $employee = Employee::findOrFail($validated['assignee_id']);
            $user = User::where('username', $employee->username_id)->first();
            Notification::create([
                'username_id' => $user->username,
                'title' => "New Workload Assigned to You",
                'message' => "You have been assigned a new workload: {$workload->title} by " . Auth::user()->employee->fname . " " . Auth::user()->employee->lname,
                'type' => "info",
                'url' => "/workload",
            ]);

            return $workload->load(['staffWL', 'employee']);
        });

        return $this->ok($data);
    }

    public function assignFaculty(Request $request)
    {
        $validated = $request->validate([
            'assignee_id' => 'required|exists:employees,id',
            'academyearId' => ['required', 'integer', 'digits:4'],
            'classId' => ['required', 'string', 'max:255'],
            'quarter' => ['required', 'integer', 'between:1,4'],
            'roomId' => ['required', 'string', 'max:255'],
            'schedFrom' => ['required', 'date', 'before_or_equal:schedTo'],
            'schedTo' => ['required', 'date', 'after_or_equal:schedFrom'],
            'subject' => ['required', 'string', 'max:255'],
            'workload_id' => ['required', 'exists:work_load_hdrs,id'],
        ]);

        $data = DB::transaction(function () use ($validated) {
            $workload = WorkLoadHdr::findOrFail($validated['workload_id']);
            $workload->update([
                'assignee_id' => $validated['assignee_id'],
            ]);

            $room = Room::findOrFail($validated['roomId']);
            $faculty = FacultyWL::create([
                'acadyearId' => $validated['academyearId'],
                'classId' => $validated['classId'],
                'quarter' => $validated['quarter'],
                'room_id' => $room->id,
                'sched_from' => $validated['schedFrom'],
                'sched_to' => $validated['schedTo'],
                'subject' => $validated['subject'],
                'workload_id' => $workload->id,
            ]);
            ActivityLog::create([
                'performed_by' => Auth::user()->username,
                'action' => 'assigned',
                'description' => "Workload {$workload->title} Assigned to {$workload->employee->fname} {$workload->employee->lname}",
                'entity_type' => FacultyWL::class,
                'entity_id' => $faculty->id,
            ]);

            $employee = Employee::findOrFail($validated['assignee_id']);
            $user = User::where('username', $employee->username_id)->first();
            Notification::create([
                'username_id' => $user->username,
                'title' => "New Workload Assigned to You",
                'message' => "You have been assigned a new workload: {$workload->title} by " . Auth::user()->employee->fname . " " . Auth::user()->employee->lname,
                'type' => "info",
                'url' => "/workload",
            ]);
            return $workload->load(['staffWL', 'employee']);
        });
        return $this->ok($data);
    }

    /**
     * Display the specified resource.
     */
    public function show()
    {
        $auth = Auth::user();
        $workload = WorkloadHdr::with([
            'facultyWL.room',
            'staffWL',
            'employee'
        ])->where('assignee_id', $auth->employee->id)->get();

        return $this->ok($workload);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $workload = workloadHdr::findOrFail($id);
        $workload->update([
            'title' => $request->input('title'),
            'from' => $request->input('from'),
            'to' => $request->input('to'),
            'type' => $request->input('type'),
        ]);
        $workload->save();
        return $this->ok($workload);
    }

    /**
     * Update the specified resource in storage.
     */
    public function updateStaff(Request $request, string $id)
    {
        $validated = $request->validate([

            'description' => 'nullable|string',
            'sched_from' => 'required|date',
            'sched_to' => 'required|date|after_or_equal:sched_from',
            'title' => 'required|string|max:255',
            'workload_id' => 'required|exists:work_load_hdrs,id',

        ]);
        $staffWl = StaffWL::findOrFail($id);
        $staffWl->update([
            'description' => $validated['description'],
            'sched_from' => $validated['sched_from'],
            'sched_to' => $validated['sched_to'],
            'title' => $validated['title'],
        ]);
        $staffWl->save();
        return $this->ok($staffWl);
    }

    /**
     * Update the specified resource in storage.
     */
    public function updateFaculty(Request $request, string $id)
    {

        $validated = $request->validate([

            'acadyearId' => ['required', 'integer', 'digits:4'],
            'classId' => ['required', 'string', 'max:255'],
            'quarter' => ['required', 'integer', 'between:1,4'],
            'room_id' => ['required', 'string', 'max:255'],
            'sched_from' => ['required', 'date', 'before_or_equal:sched_to'],
            'sched_to' => ['required', 'date', 'after_or_equal:sched_from'],
            'subject' => ['required', 'string', 'max:255'],
            'workload_id' => ['required', 'exists:work_load_hdrs,id'],
        ]);

        $facultyWl = FacultyWL::findOrFail($id);
        $room = Room::findOrFail($validated['room_id']);
        $facultyWl->update([
            'acadyearId' => $validated['acadyearId'],
            'classId' => $validated['classId'],
            'quarter' => $validated['quarter'],
            'room_id' => $room->id,
            'sched_from' => $validated['sched_from'],
            'sched_to' => $validated['sched_to'],
            'subject' => $validated['subject'],
        ]);
        $facultyWl->save();
        return $this->ok($facultyWl);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function myCreated()
    {
        $auth = Auth::user();
        $workloads = WorkLoadHdr::with([
            'facultyWL.room',
            'staffWL',
            'employee'
        ])->where('created_by', $auth->username)->orderBy('created_at', 'desc')->get();

        return $this->ok($workloads);
    }

    public function approve(Request $request, string $id)
    {
        $workload = WorkLoadHdr::findOrFail($id);
        $workload->update([
            'status' => 'APPROVED',
            'approved_by' => Auth::user()->username,
            'approved_at' => now(),
            'approval_remarks' => $request->input('remarks'),
        ]);

        // Notify assignee (teacher) if assigned
        if ($workload->assignee_id) {
            $employee = Employee::findOrFail($workload->assignee_id);
            $user = User::where('username', $employee->username_id)->first();
            Notification::create([
                'username_id' => $user->username,
                'title' => "Schedule Approved",
                'message' => "Your schedule '{$workload->title}' has been approved by the Principal.",
                'type' => "success",
                'url' => "/schedule",
            ]);
        }

        // Notify creator (grade leader)
        Notification::create([
            'username_id' => $workload->created_by,
            'title' => "Schedule Approved",
            'message' => "Your schedule '{$workload->title}' has been approved.",
            'type' => "success",
            'url' => "/schedule",
        ]);

        return $this->ok($workload->load(['facultyWL.room','staffWL','employee']));
    }

    public function reject(Request $request, string $id)
    {
        $validated = $request->validate([
            'remarks' => 'nullable|string|max:500',
        ]);

        $workload = WorkLoadHdr::findOrFail($id);
        $workload->update([
            'status' => 'REJECTED',
            'rejected_by' => Auth::user()->username,
            'rejected_at' => now(),
            'approval_remarks' => $validated['remarks'] ?? null,
        ]);

        // Notify creator (grade leader)
        Notification::create([
            'username_id' => $workload->created_by,
            'title' => "Schedule Rejected",
            'message' => "Your schedule '{$workload->title}' was rejected by the Principal." . ($workload->approval_remarks ? " Remarks: {$workload->approval_remarks}" : ""),
            'type' => "error",
            'url' => "/schedule",
        ]);

        return $this->ok($workload->load(['facultyWL.room','staffWL','employee']));
    }
}