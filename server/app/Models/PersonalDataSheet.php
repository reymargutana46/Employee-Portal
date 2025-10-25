<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonalDataSheet extends Model
{

    protected $fillable = [
        'uploader',
        'file_path',
        'file_name',
        'file_size',
        'file_type',
        'owner_name'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'uploader', 'username');
    }
    
    // Accessor for uploaded_at
    public function getUploadedAtAttribute()
    {
        return $this->created_at;
    }
}