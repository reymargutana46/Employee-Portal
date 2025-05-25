<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notification extends Model
{
    use SoftDeletes;

    protected $table = 'notifications';
    protected $fillable = [
        'username_id',
        'title',
        'message',
        'is_read',
        'read_at',
        'type',
        'url',
    ];
    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];
    public function user()
    {
        return $this->belongsTo(User::class, 'username_id');
    }
}
