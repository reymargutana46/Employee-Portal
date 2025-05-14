<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkLoadHdr extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'title',
        'from',
        'to',
        'type',
        'assignee_id',
        'created_by'
    ];

    /**
     * Get the employees that owns the WorkHourHdr
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class,'assignee_id','id');
    }
    /**
     * Get the user that owns the WorkHourHdr
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by','username');
    }

    /**
     * Get all of the facultyWL for the WorkLoadHdr
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function facultyWL(): HasOne
    {
        return $this->hasOne(FacultyWL::class,'workload_id','id');
    }

    /**
     * Get all of the StaffWL for the WorkLoadHdr
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function staffWL(): HasOne
    {
        return $this->hasOne(StaffWL::class,'workload_id','id');
    }
}
