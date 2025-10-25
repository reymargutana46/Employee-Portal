<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Storage;

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

    // Accessor for file_url
    public function getFileUrlAttribute()
    {
        return Storage::disk('public')->url($this->file_path);
    }

    // Accessor for original_name (same as file_name)
    public function getOriginalNameAttribute()
    {
        return $this->file_name;
    }
}
