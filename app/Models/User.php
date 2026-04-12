<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
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
     * Check if the user has access to a specific module.
     * Checks enum role.
     */
    public function hasModuleAccess(string $moduleCode): bool
    {
        // Super admin and admin have access to all modules
        if (in_array($this->role, ['super_admin', 'admin', 'staff'])) {
            return true;
        }

        return false;
    }

    /**
     * Check if the user has any of the specified roles.
     * Checks enum role.
     *
     * @param  array<string>|string  $roleNames
     */
    public function hasAnyRole(array|string $roleNames): bool
    {
        $roleNames = is_array($roleNames) ? $roleNames : [$roleNames];

        // Check enum role
        return in_array($this->role, $roleNames);
    }
}
