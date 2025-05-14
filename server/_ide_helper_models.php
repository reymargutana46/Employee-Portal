<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $time_in
 * @property string $time_out
 * @property int $employee_id
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Employee $Employee
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DTRPmtime newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DTRPmtime newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DTRPmtime onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DTRPmtime query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DTRPmtime whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DTRPmtime whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DTRPmtime whereEmployeeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DTRPmtime whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DTRPmtime whereTimeIn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DTRPmtime whereTimeOut($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DTRPmtime whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DTRPmtime withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DTRPmtime withoutTrashed()
 */
	class DTRPmtime extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Employee> $Employee
 * @property-read int|null $employee_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department withoutTrashed()
 */
	class Department extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $time_in
 * @property string $time_out
 * @property int $employee_id
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Employee $Employee
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DtrAmtime newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DtrAmtime newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DtrAmtime onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DtrAmtime query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DtrAmtime whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DtrAmtime whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DtrAmtime whereEmployeeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DtrAmtime whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DtrAmtime whereTimeIn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DtrAmtime whereTimeOut($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DtrAmtime whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DtrAmtime withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DtrAmtime withoutTrashed()
 */
	class DtrAmtime extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $fname
 * @property string $lname
 * @property string|null $mname
 * @property string|null $extname
 * @property int $username_id
 * @property string $biod
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property int $position_id
 * @property int $department_id
 * @property int $workhour_id
 * @property string $email
 * @property string $contactno
 * @property string $telno
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DtrAmtime> $DTRAmTimes
 * @property-read int|null $d_t_r_am_times_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DTRPmtime> $DTRPmTimes
 * @property-read int|null $d_t_r_pm_times_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\WorkLoadHdr> $WorkLoad
 * @property-read int|null $work_load_count
 * @property-read \App\Models\Department $department
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Leaves\Leave> $leaves
 * @property-read int|null $leaves_count
 * @property-read \App\Models\Position $position
 * @property-read \App\Models\User $user
 * @property-read \App\Models\Workhour $workhour
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereBiod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereContactno($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereDepartmentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereExtname($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereFname($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereLname($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereMname($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee wherePositionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereTelno($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereUsernameId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee whereWorkhourId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Employee withoutTrashed()
 */
	class Employee extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property-read \App\Models\Room|null $room
 * @property-read \App\Models\WorkLoadHdr|null $workload
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FacultyWL newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FacultyWL newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FacultyWL onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FacultyWL query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FacultyWL withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FacultyWL withoutTrashed()
 */
	class FacultyWL extends \Eloquent {}
}

namespace App\Models\Leaves{
/**
 * 
 *
 * @property int $id
 * @property string $from
 * @property string $to
 * @property string $reason
 * @property string $status
 * @property int $type_id
 * @property int $employee_id
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Employee $employee
 * @property-read \App\Models\Leaves\LeaveRejection|null $leaveRejection
 * @property-read \App\Models\Leaves\LeaveType $leaveType
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave whereEmployeeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave whereFrom($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave whereTo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave whereTypeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave withoutTrashed()
 */
	class Leave extends \Eloquent {}
}

namespace App\Models\Leaves{
/**
 * 
 *
 * @property int $id
 * @property int $rejected_by
 * @property int $leave_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string $rejreason
 * @property-read \App\Models\Leaves\Leave $leave
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRejection newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRejection newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRejection query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRejection whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRejection whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRejection whereLeaveId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRejection whereRejectedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRejection whereRejreason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRejection whereUpdatedAt($value)
 */
	class LeaveRejection extends \Eloquent {}
}

namespace App\Models\Leaves{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Leaves\Leave> $leaves
 * @property-read int|null $leaves_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveType newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveType newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveType query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveType whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveType whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveType whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveType whereUpdatedAt($value)
 */
	class LeaveType extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Room> $room
 * @property-read int|null $room_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Location newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Location newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Location onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Location query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Location whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Location whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Location whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Location whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Location withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Location withoutTrashed()
 */
	class Location extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $title
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Employee> $Employee
 * @property-read int|null $employee_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Position newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Position newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Position onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Position query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Position whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Position whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Position whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Position whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Position whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Position withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Position withoutTrashed()
 */
	class Position extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role withoutTrashed()
 */
	class Role extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property int $location_id
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\FacultyWL> $facultyWL
 * @property-read int|null $faculty_w_l_count
 * @property-read \App\Models\Location $location
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room whereLocationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Room withoutTrashed()
 */
	class Room extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $request_to
 * @property int $request_by
 * @property string $title
 * @property string $priority
 * @property string $status
 * @property string $remarks
 * @property int $rating
 * @property string $from
 * @property string $to
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $requestBy
 * @property-read \App\Models\User $requestTo
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest whereFrom($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest wherePriority($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest whereRating($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest whereRequestBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest whereRequestTo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest whereTo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceRequest withoutTrashed()
 */
	class ServiceRequest extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property-read \App\Models\WorkLoadHdr|null $workload
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StaffWL newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StaffWL newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StaffWL onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StaffWL query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StaffWL withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StaffWL withoutTrashed()
 */
	class StaffWL extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property string $username
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ServiceRequest> $UserRequestee
 * @property-read int|null $user_requestee_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\WorkLoadHdr> $WorkLoadHdr
 * @property-read int|null $work_load_hdr_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DtrAmtime> $dtrAmtime
 * @property-read int|null $dtr_amtime_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DTRPmtime> $dtrPmtime
 * @property-read int|null $dtr_pmtime_count
 * @property-read \App\Models\Employee|null $employee
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Leaves\LeaveRejection> $leaveRejection
 * @property-read int|null $leave_rejection_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ServiceRequest> $serviceRequest
 * @property-read int|null $service_request_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ServiceRequest> $userRequester
 * @property-read int|null $user_requester_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUsername($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutTrashed()
 */
	class User extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $am
 * @property string $pm
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Employee|null $employees
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\FacultyWL> $facultyWL
 * @property-read int|null $faculty_w_l_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StaffWL> $staffWL
 * @property-read int|null $staff_w_l_count
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkLoadHdr newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkLoadHdr newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkLoadHdr onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkLoadHdr query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkLoadHdr whereAm($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkLoadHdr whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkLoadHdr whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkLoadHdr whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkLoadHdr wherePm($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkLoadHdr whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkLoadHdr withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkLoadHdr withoutTrashed()
 */
	class WorkLoadHdr extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $am
 * @property string $pm
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Employee> $employees
 * @property-read int|null $employees_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workhour newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workhour newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workhour onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workhour query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workhour whereAm($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workhour whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workhour whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workhour whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workhour wherePm($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workhour whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workhour withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workhour withoutTrashed()
 */
	class Workhour extends \Eloquent {}
}

