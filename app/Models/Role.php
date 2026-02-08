<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'is_system',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
        ];
    }

    /**
     * Get the users that have this role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_roles', 'role_id', 'user_id')
            ->withTimestamps();
    }

    /**
     * Get the modules that this role has access to.
     */
    public function modules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class, 'role_module_access', 'role_id', 'module_code', 'id', 'code')
            ->withPivot('created_at');
    }

    /**
     * Check if this role has access to a specific module.
     */
    public function hasModuleAccess(string $moduleCode): bool
    {
        return $this->modules()->where('code', $moduleCode)->exists();
    }

    /**
     * Check if this is a system role.
     */
    public function isSystem(): bool
    {
        return $this->is_system === true;
    }
}
