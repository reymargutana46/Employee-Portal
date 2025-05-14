<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Workhour extends Model
{
    use SoftDeletes;

    protected $fillable=['am','pm'];


    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

}
