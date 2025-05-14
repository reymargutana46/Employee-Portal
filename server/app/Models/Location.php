<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Location extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name'
    ];
    /**
     * Get all of the room for the Location
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function room(): HasMany
    {
        return $this->hasMany(Room::class);
    }
}
