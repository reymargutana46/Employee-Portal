<?php

namespace App\Http\Controllers;

use App\Models\ClassSchedule;
use App\Models\Notification;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ClassScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $schedules = ClassSchedule::with(['creator', 'approver', 'rejector'])
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->ok($schedules);
    }

    /**
     * Get schedules created by the authenticated user
     */
    public function myCreated()
    {
        $auth = Auth::user();
        $schedules = ClassSchedule::with(['creator', 'approver', 'rejector'])
            ->where('created_by', $auth->username)
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->ok($schedules);
    }

    /**
     * Get schedules assigned to the authenticated faculty member
     */
    public function myAssigned()
    {
        $auth = Auth::user();
        $employee = Employee::where('username_id', $auth->username)->first();

        if (!$employee) {
            return $this->notFound('Employee record not found');
        }

        // Get the full name of the current user for matching
        $userFullName = trim($employee->fname . ' ' . $employee->lname);
        $userFirstName = trim($employee->fname);
        $userLastName = trim($employee->lname);

        \Log::info('Looking for schedules for user', [
            'username' => $auth->username,
            'full_name' => $userFullName,
            'first_name' => $userFirstName,
            'last_name' => $userLastName
        ]);

        // Get all approved schedules
        $allSchedules = ClassSchedule::with(['creator', 'approver', 'rejector'])
            ->where('status', 'APPROVED')
            ->get();

        \Log::info('Total approved schedules found', ['count' => $allSchedules->count()]);

        $assignedSchedules = $allSchedules->filter(function ($schedule) use ($userFullName, $userFirstName, $userLastName) {
            // Check if user is the adviser teacher (multiple matching strategies)
            $adviserMatches = [
                stripos($schedule->adviser_teacher, $userFullName) !== false,
                stripos($schedule->adviser_teacher, $userFirstName) !== false && stripos($schedule->adviser_teacher, $userLastName) !== false,
                stripos($schedule->adviser_teacher, $userLastName) !== false && stripos($schedule->adviser_teacher, $userFirstName) !== false
            ];

            if (array_filter($adviserMatches)) {
                \Log::info('Found schedule match via adviser', [
                    'schedule_id' => $schedule->id,
                    'grade_section' => $schedule->grade_section,
                    'adviser_teacher' => $schedule->adviser_teacher,
                    'user_name' => $userFullName
                ]);
                return true;
            }

            // Check if user is mentioned in any schedule data
            foreach ($schedule->schedule_data as $row) {
                $mondayThursdayMatches = [
                    stripos($row['mondayThursday'], $userFullName) !== false,
                    stripos($row['mondayThursday'], $userFirstName) !== false && stripos($row['mondayThursday'], $userLastName) !== false,
                    stripos($row['mondayThursday'], $userLastName) !== false && stripos($row['mondayThursday'], $userFirstName) !== false
                ];

                $fridayMatches = [
                    stripos($row['friday'], $userFullName) !== false,
                    stripos($row['friday'], $userFirstName) !== false && stripos($row['friday'], $userLastName) !== false,
                    stripos($row['friday'], $userLastName) !== false && stripos($row['friday'], $userFirstName) !== false
                ];

                if (array_filter($mondayThursdayMatches) || array_filter($fridayMatches)) {
                    \Log::info('Found schedule match via schedule data', [
                        'schedule_id' => $schedule->id,
                        'grade_section' => $schedule->grade_section,
                        'user_name' => $userFullName,
                        'monday_thursday' => $row['mondayThursday'],
                        'friday' => $row['friday']
                    ]);
                    return true;
                }
            }

            return false;
        })->values(); // Reset array keys

        \Log::info('Assigned schedules found for user', [
            'username' => $auth->username,
            'count' => $assignedSchedules->count(),
            'schedules' => $assignedSchedules->pluck('grade_section')->toArray()
        ]);

        return $this->ok($assignedSchedules);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'grade_section' => 'required|string|max:255',
            'school_year' => 'required|string|max:255',
            'adviser_teacher' => 'required|string|max:255',
            'male_learners' => 'required|integer|min:0',
            'female_learners' => 'required|integer|min:0',
            'total_learners' => 'required|integer|min:0',
            'schedule_data' => 'required|array',
        ]);

        try {
            $schedule = null;

            DB::transaction(function () use ($validated, &$schedule) {
                $schedule = ClassSchedule::create([
                    ...$validated,
                    'created_by' => Auth::user()->username,
                    'status' => 'PENDING'
                ]);
            });

            // Check if schedule was created successfully
            if (!$schedule) {
                throw new \Exception('Failed to create schedule');
            }

            // Determine the creator role for the notification message
            $creator = Auth::user();
            $creatorRole = 'Grade Leader';

            // Check if the creator is a Principal
            if ($creator->hasRole('Principal')) {
                $creatorRole = 'Principal';
            }

            // Notify all principals about the new schedule for approval (outside transaction)
            $principals = User::whereHas('roles', function ($query) {
                $query->where('name', 'Principal');
            })->get();

            foreach ($principals as $principal) {
                try {
                    Notification::create([
                        'username_id' => $principal->username,
                        'title' => 'New Class Schedule Requires Approval',
                        'message' => $creatorRole . ' has created a new class schedule for \'' . $schedule->grade_section . '\' - School Year ' . $schedule->school_year . '. Please review and approve.',
                        'type' => 'info',
                        'url' => '/workload',
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Failed to create notification', [
                        'principal' => $principal->username,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            return $this->ok($schedule->load(['creator']), 'Class schedule created successfully and sent for approval');
        } catch (\Exception $e) {
            return $this->badRequest('Failed to create schedule: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $schedule = ClassSchedule::with(['creator', 'approver', 'rejector'])->findOrFail($id);
        return $this->ok($schedule);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $schedule = ClassSchedule::findOrFail($id);

        // Only allow updates if status is PENDING or REJECTED
        if (!in_array($schedule->status, ['PENDING', 'REJECTED'])) {
            return $this->badRequest('Cannot update an approved schedule');
        }

        $validated = $request->validate([
            'grade_section' => 'required|string|max:255',
            'school_year' => 'required|string|max:255',
            'adviser_teacher' => 'required|string|max:255',
            'male_learners' => 'required|integer|min:0',
            'female_learners' => 'required|integer|min:0',
            'total_learners' => 'required|integer|min:0',
            'schedule_data' => 'required|array',
        ]);

        $schedule->update([
            ...$validated,
            'status' => 'PENDING', // Reset to pending when updated
        ]);

        return $this->ok($schedule->load(['creator']), 'Schedule updated successfully');
    }

    /**
     * Approve a class schedule
     */
    public function approve(Request $request, string $id)
    {
        $validated = $request->validate([
            'remarks' => 'nullable|string|max:500',
        ]);

        $schedule = ClassSchedule::findOrFail($id);

        $schedule->update([
            'status' => 'APPROVED',
            'approved_by' => Auth::user()->username,
            'approved_at' => now(),
            'approval_remarks' => $validated['remarks'] ?? null,
        ]);

        // Notify the creator (grade leader)
        Notification::create([
            'username_id' => $schedule->created_by,
            'title' => 'Class Schedule Approved',
            'message' => "Your class schedule for '{$schedule->grade_section}' has been approved by the Principal." . ($schedule->approval_remarks ? " Remarks: {$schedule->approval_remarks}" : ""),
            'type' => 'success',
            'url' => '/schedule',
        ]);

        // Notify teachers/faculty mentioned in the schedule
        $teachers = $this->findTeachersBySchedule($schedule);

        \Log::info('Found teachers for notification', [
            'schedule_id' => $schedule->id,
            'teacher_count' => $teachers->count(),
            'teachers' => $teachers->pluck('matched_name')->toArray()
        ]);

        foreach ($teachers as $teacherData) {
            try {
                Notification::create([
                    'username_id' => $teacherData['user']->username,
                    'title' => 'New Class Schedule Assignment',
                    'message' => "You have been assigned to '{$schedule->grade_section}' - School Year {$schedule->school_year}. The schedule has been approved by the Principal.",
                    'type' => 'info',
                    'url' => '/schedule',
                ]);

                \Log::info('Teacher notification sent', [
                    'teacher' => $teacherData['matched_name'],
                    'username' => $teacherData['user']->username,
                    'schedule' => $schedule->grade_section
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to create teacher notification', [
                    'teacher' => $teacherData['user']->username,
                    'schedule_id' => $schedule->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $this->ok($schedule->load(['creator', 'approver']), 'Schedule approved successfully');
    }

    /**
     * Reject a class schedule
     */
    public function reject(Request $request, string $id)
    {
        $validated = $request->validate([
            'remarks' => 'nullable|string|max:500',
        ]);

        $schedule = ClassSchedule::findOrFail($id);

        $schedule->update([
            'status' => 'REJECTED',
            'rejected_by' => Auth::user()->username,
            'rejected_at' => now(),
            'approval_remarks' => $validated['remarks'] ?? null,
        ]);

        // Notify the creator (grade leader)
        Notification::create([
            'username_id' => $schedule->created_by,
            'title' => 'Class Schedule Disapproved',
            'message' => "Your class schedule for '".$schedule->grade_section."' was disapproved by the Principal." . ($schedule->approval_remarks ? " Remarks: '".$schedule->approval_remarks."'" : ""),
            'type' => 'error',
            'url' => '/schedule',
        ]);

        // Notify teachers/faculty that the schedule assignment was disapproved
        $teachers = $this->findTeachersBySchedule($schedule);

        foreach ($teachers as $teacherData) {
            try {
                Notification::create([
                    'username_id' => $teacherData['user']->username,
                    'title' => 'Class Schedule Assignment Canceled',
                    'message' => "The class schedule assignment for '".$schedule->grade_section."' - School Year ".$schedule->school_year." has been disapproved by the Principal.",
                    'type' => 'warning',
                    'url' => '/schedule',
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to create teacher disapproval notification', [
                    'teacher' => $teacherData['user']->username,
                    'schedule_id' => $schedule->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $this->ok($schedule->load(['creator', 'rejector']), 'Schedule disapproved');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $schedule = ClassSchedule::findOrFail($id);

        // Only allow deletion if status is PENDING or REJECTED
        if ($schedule->status === 'APPROVED') {
            return $this->badRequest('Cannot delete an approved schedule');
        }

        $schedule->delete();
        return $this->ok(null, 'Schedule deleted successfully');
    }

    /**
     * Find teachers/faculty by name from schedule data
     */
    private function findTeachersBySchedule(ClassSchedule $schedule)
    {
        $teacherNames = collect();

        // Add adviser teacher
        if (!empty($schedule->adviser_teacher)) {
            $teacherNames->push($schedule->adviser_teacher);
        }

        // Extract teacher names from schedule_data (subjects might contain teacher names)
        foreach ($schedule->schedule_data as $row) {
            if (!empty($row['mondayThursday']) && !in_array($row['mondayThursday'], ['Flag Ceremony', 'Recess', 'Lunch'])) {
                // If it looks like a teacher name (contains space and capital letters)
                if (preg_match('/^[A-Z][a-z]+ [A-Z]/', $row['mondayThursday'])) {
                    $teacherNames->push($row['mondayThursday']);
                }
            }
            if (!empty($row['friday']) && !in_array($row['friday'], ['Flag Ceremony', 'Recess', 'Lunch'])) {
                if (preg_match('/^[A-Z][a-z]+ [A-Z]/', $row['friday'])) {
                    $teacherNames->push($row['friday']);
                }
            }
        }

        // Find employees/users matching these names
        $teachers = collect();

        foreach ($teacherNames->unique() as $teacherName) {
            // Try different matching strategies
            $employee = null;

            // 1. Exact match with full name
            $employee = Employee::whereRaw("CONCAT(fname, ' ', lname) = ?", [$teacherName])
                ->orWhereRaw("CONCAT(fname, ' ', mname, ' ', lname) = ?", [$teacherName])
                ->first();

            // 2. If no exact match, try case-insensitive match
            if (!$employee) {
                $employee = Employee::whereRaw("LOWER(CONCAT(fname, ' ', lname)) = LOWER(?)", [$teacherName])
                    ->orWhereRaw("LOWER(CONCAT(fname, ' ', mname, ' ', lname)) = LOWER(?)", [$teacherName])
                    ->first();
            }

            if (!$employee) {
                $nameParts = explode(' ', $teacherName);
                if (count($nameParts) >= 2) {
                    $firstName = $nameParts[0];
                    $lastName = $nameParts[count($nameParts) - 1];

                    $employee = Employee::whereRaw("LOWER(fname) LIKE LOWER(?) AND LOWER(lname) LIKE LOWER(?)",
                        ["%{$firstName}%", "%{$lastName}%"])
                        ->first();
                }
            }

            if ($employee && $employee->username_id) {
                // Check if user has Faculty role
                $user = User::where('username', $employee->username_id)
                    ->whereHas('roles', function($query) {
                        $query->where('name', 'Faculty');
                    })
                    ->first();

                if ($user) {
                    $teachers->push([
                        'user' => $user,
                        'employee' => $employee,
                        'name' => $teacherName,
                        'matched_name' => trim($employee->fname . ' ' . $employee->lname)
                    ]);
                }
            }
        }

        return $teachers;
    }
}
