<?php

namespace App\Models\Leaves;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Leave extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'type_id',
        'from',
        'to',
        'reason',
        'status',
        'employee_id'
    ];

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class, 'type_id', 'id');
    }
    public function leaveRejection()
    {
        return $this->hasOne(LeaveRejection::class);
    }

    /**
     * Get the employee that owns the Leave
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
