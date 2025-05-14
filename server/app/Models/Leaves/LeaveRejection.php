<?php

namespace App\Models\Leaves;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class LeaveRejection extends Model
{
    protected $fillable=[
        'rejected_by',
        'rejreason',
        'leave_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'rejected_by', 'username');
    }

    public function leave()
    {
        return $this->belongsTo(Leave::class);
    }

}
