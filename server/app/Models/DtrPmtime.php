<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DTRPmtime extends Model
{
    use SoftDeletes;
    protected $table = 'dtr_pmtimes';
    protected $fillable = [
        'employee_id',
        'time_in',
        'time_out',
    ];

    public function Employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
