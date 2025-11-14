<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Leaves\LeaveRejection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'password',
        'role_id',
        'is_active'
    ];

    protected $keyType = 'string';
    public $incrementing = false;
    protected $primaryKey = 'username';

    protected static function booted()
    {
        static::deleting(function ($user) {
            $user->roles()->detach();
        });
    }

    public function leaveRejection()
    {
        return $this->hasMany(LeaveRejection::class, 'rejected_by');
    }
    public function serviceRequest()
    {
        return $this->hasMany(serviceRequest::class, 'request_by');
    }
    public function hasRole($roles)
    {
        if (is_array($roles)) {
            return $this->roles()->whereIn('name', $roles)->exists();
        }

        return $this->roles()->where('name', $roles)->exists();
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];


    public function employee()
    {
        return $this->hasOne(Employee::class, 'username_id', 'username');
    }
    public function notifications()
    {
        return $this->hasMany(Employee::class, 'username_id', 'username');
    }
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_user', 'username_id', 'role_id');
    }
    /**
     * Get all of the WorkLoadHdr for the User
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function WorkLoadHdr(): HasMany
    {
        return $this->hasMany(WorkLoadHdr::class, 'created_by', 'username');
    }
    /**
     * Get service requests where this user's employee record is the recipient
     * Note: ServiceRequest.request_to references Employee.id, not User.username
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasManyThrough
     */
    public function UserRequestee()
    {
        return $this->hasManyThrough(
            ServiceRequest::class,
            Employee::class,
            'username_id', // Foreign key on employees table
            'request_to',   // Foreign key on service_requests table
            'username',     // Local key on users table
            'id'           // Local key on employees table
        );
    }

    /**
     * Get all of the userRequester for the User
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function userRequester(): HasMany
    {
        return $this->hasMany(ServiceRequest::class, 'request_by', 'username');
    }

    /**
     * Get all of the dtrAmtime for the User
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function dtrAmtime(): HasMany
    {
        return $this->hasMany(DtrAmtime::class);
    }

    /**
     * Get all of the dtrPmtime for the User
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function dtrPmtime(): HasMany
    {
        return $this->hasMany(DTRPmtime::class);
    }


    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Check if user has any associated data that would prevent deletion
     */
    public function hasAssociatedData(): bool
    {
        try {
            // Check for any related data that indicates the user has been active
            return $this->WorkLoadHdr()->exists() ||
                   $this->UserRequestee()->exists() || // Requests TO this user's employee record
                   $this->userRequester()->exists() || // Requests made BY this user
                   $this->dtrAmtime()->exists() ||
                   $this->dtrPmtime()->exists() ||
                   $this->leaveRejection()->exists() ||
                   \App\Models\PersonalDataSheet::where('uploader', $this->username)->exists() ||
                   \App\Models\ActivityLog::where('performed_by', $this->username)->exists();
        } catch (\Exception $e) {
            // If there's an error checking relationships, assume the user has data to be safe
            \Log::error('Error checking user associated data: ' . $e->getMessage());
            return true;
        }
    }
}
