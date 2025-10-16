<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class ServiceRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'request_to',
        'title',
        'details',
        'priority',
        'status',
        'from',
        'to',
        'request_by',
        'rating',
        'remarks'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];


    public function requestBy()
    {
        return $this->belongsTo(User::class, 'request_by', 'username');
    }

    public function requestTo()
    {
        return $this->belongsTo(Employee::class,'request_to', 'id');
    }
}
