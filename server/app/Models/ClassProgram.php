<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClassProgram extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'class_programs';

    protected $fillable = [
        'grade_section',
        'school_year',
        'adviser_teacher',
        'male_learners',
        'female_learners',
        'total_learners',
        'schedule_data',
        'created_by',
    ];

    protected $casts = [
        'schedule_data' => 'array',
        'male_learners' => 'integer',
        'female_learners' => 'integer',
        'total_learners' => 'integer',
    ];

    /**
     * Relationship with User (creator)
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'username');
    }

    /**
     * Automatically calculate total learners
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($classProgram) {
            $classProgram->total_learners = $classProgram->male_learners + $classProgram->female_learners;
        });
    }
}