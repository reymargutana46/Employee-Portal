<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StaffWL extends Model
{
    use SoftDeletes;

    protected $table = "staff_wls";
    protected $fillable = [
        'title',
        'description',
        'sched_from',
        'sched_to',
        'workload_id'

    ];


    /**
     * Get the workload that owns the StaffWL
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function workload(): BelongsTo
    {
        return $this->belongsTo(WorkLoadHdr::class);
    }
}
