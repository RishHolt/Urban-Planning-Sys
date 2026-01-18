<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'user_db';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'role',
        'email_verified',
        'department',
        'position',
        'account_no',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
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
            'email_verified' => 'boolean',
            'password' => 'hashed',
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
     * Get the department associated with the user.
     */
    public function departmentRelation(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department', 'code');
    }

    /**
     * Generate account number based on role and department.
     */
    public static function generateAccountNo(string $role, ?string $department = null): string
    {
        // Role prefix: U for user, S for staff/admin/superadmin
        $rolePrefix = in_array($role, ['staff', 'admin', 'superadmin']) ? 'S' : 'U';

        // Department code: Use department code if exists, otherwise 'O'
        $deptCode = $department ? $department : 'O';

        // Generate random 8-digit number
        $number = str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT);

        return $rolePrefix.$deptCode.$number;
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($user) {
            if (! $user->account_no) {
                do {
                    $accountNo = self::generateAccountNo($user->role ?? 'user', $user->department);
                } while (self::where('account_no', $accountNo)->exists());

                $user->account_no = $accountNo;
            }
        });
    }
}
