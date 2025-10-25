<?php

namespace App\Models;

use App\Models\Leaves\Leave;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;


    protected $fillable = [
        'fname',
        'lname',
        'mname',
        'extname',
        'username_id',
        'biod',
        'deleted',
        'position_id',
        'department_id',
        'email',
        'contactno',
        'workhour_id',
        'telno',
        'profile_picture'
    ];

    public function getFullName()
    {
        // Build full name properly, only adding spaces when values exist
        $parts = [];
        
        if (!empty($this->fname)) {
            $parts[] = trim($this->fname);
        }
        
        if (!empty($this->mname)) {
            $parts[] = trim($this->mname);
        }
        
        if (!empty($this->lname)) {
            $parts[] = trim($this->lname);
        }
        
        $fullName = implode(' ', $parts);
        
        if (!empty($this->extname)) {
            $fullName = trim($this->extname) . ' ' . $fullName;
        }
        
        return trim($fullName);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function DTRAmTimes()
    {
        return $this->hasMany(DtrAmtime::class);
    }
    public function DTRPmTimes()
    {
        return $this->hasMany(DTRPmtime::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'username_id');
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }
    public function workhour()
    {
        return $this->belongsTo(Workhour::class);
    }
    /**
     * Get all of the WorkLoad for the Employee
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function WorkLoad(): HasMany
    {
        return $this->hasMany(WorkLoadHdr::class, 'assignee', 'id');
    }
    /**
     * Get all of the leaves for the Employee
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function leaves(): HasMany
    {
        return $this->hasMany(Leave::class);
    }
}