<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dtrecord extends Model
{
    protected $fillable = [
        'employee_name',
        'employee_id',
        'date',
        'time_in',
        'time_out',
    ];

    protected $casts = [
        'date' => 'date',
        'time_in' => 'string',
        'time_out' => 'string',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}