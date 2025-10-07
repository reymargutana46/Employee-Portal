<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ClassSchedule extends Model
{
    protected $fillable = [
        'grade_section',
        'school_year',
        'adviser_teacher',
        'male_learners',
        'female_learners',
        'total_learners',
        'schedule_data',
        'created_by',
        'status',
        'approval_remarks',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at'
    ];

    protected $casts = [
        'schedule_data' => 'array',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'username');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by', 'username');
    }

    public function rejector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by', 'username');
    }
}
