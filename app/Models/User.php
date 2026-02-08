<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'password',
        'role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
    ];

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
     * Get the profile associated with the user.
     */
    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    /**
     * Get the email verifications for the user.
     */
    public function emailVerifications(): HasMany
    {
        return $this->hasMany(EmailVerification::class, 'email', 'email');
    }

    /**
     * Get the roles assigned to the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id')
            ->withPivot('created_at');
    }

    /**
     * Check if the user has access to a specific module.
     * Checks both enum role and dynamic roles.
     */
    public function hasModuleAccess(string $moduleCode): bool
    {
        // Super admin and admin have access to all modules
        if (in_array($this->role, ['super_admin', 'admin'])) {
            return true;
        }

        // Staff also have access to all modules
        if ($this->role === 'staff') {
            return true;
        }

        // Check dynamic roles for module access
        return $this->roles()
            ->whereHas('modules', function ($query) use ($moduleCode) {
                $query->where('code', $moduleCode);
            })
            ->exists();
    }

    /**
     * Check if the user has any of the specified roles.
     * Checks both enum role and dynamic roles.
     *
     * @param  array<string>|string  $roleNames
     */
    public function hasAnyRole(array|string $roleNames): bool
    {
        $roleNames = is_array($roleNames) ? $roleNames : [$roleNames];

        // Check enum role
        if (in_array($this->role, $roleNames)) {
            return true;
        }

        // Check dynamic roles
        return $this->roles()
            ->whereIn('name', $roleNames)
            ->exists();
    }
}
