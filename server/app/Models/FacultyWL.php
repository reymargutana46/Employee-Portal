<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FacultyWL extends Model
{
    use SoftDeletes;
    protected $table = "faculty_wls";
    protected $fillable = [
        'workload_id',
        'subject',
        'sched_from',
        'sched_to',
        'quarter',
        'room_id',
        'classId',
        'acadyearId',

    ];

    /**
     * Get the workload that owns the FacultyWL
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function workload(): BelongsTo
    {
        return $this->belongsTo(WorkloadHdr::class, 'workload_id', 'id');
    }
    /**
     * Get the room that owns the FacultyWL
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class,'room_id','id');
    }
}
