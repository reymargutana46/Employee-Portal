<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ActivityLog extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'performed_by',
        'action',
        'description',
        'entity_type',
        'entity_id',

    ];

    public function user()
    {
        return $this->belongsTo(User::class, "Performed_by", "username");
    }
    public function getCreatedAtFormattedAttribute()
    {
        return $this->created_at ? $this->created_at->format('F j, Y g:i A') : null;
    }
}
