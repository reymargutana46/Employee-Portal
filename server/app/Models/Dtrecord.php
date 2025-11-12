<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dtrecord extends Model
{
    protected $fillable = [
        'employee_name',
        'employee_id',
        'date',
        'am_time_in',
        'am_time_out',
        'pm_time_in',
        'pm_time_out',
    ];

    protected $casts = [
        'date' => 'date',
        'am_time_in' => 'string',
        'am_time_out' => 'string',
        'pm_time_in' => 'string',
        'pm_time_out' => 'string',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}