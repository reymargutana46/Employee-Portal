<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Room extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'location_id',

    ];

    /**
     * Get all of the facultyWL for the Room
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function facultyWL(): HasMany
    {
        return $this->hasMany(FacultyWL::class,'room_id','id');
    }

    /**
     * Get the location that owns the Room
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}
