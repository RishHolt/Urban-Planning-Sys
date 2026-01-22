<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Get the migration connection name.
     * Uses 'user_db' connection for user database.
     */
    public function getConnection(): ?string
    {
        return 'user_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('user_db')->table('users', function (Blueprint $table) {
            // Remove columns
            $table->dropColumn([
                'username',
                'account_no',
                'department',
                'position',
                'email_verified',
                'remember_token',
            ]);

            // Add new columns
            $table->boolean('is_active')->default(true)->after('role');
            $table->softDeletes()->after('updated_at');
        });

        // Update role enum - MySQL requires dropping and recreating the column
        DB::connection('user_db')->statement("ALTER TABLE users MODIFY COLUMN role ENUM('citizen', 'staff', 'admin', 'inspector', 'developer', 'committee_member') DEFAULT 'citizen'");

        // Migrate existing data
        DB::connection('user_db')->table('users')
            ->where('role', 'user')
            ->update(['role' => 'citizen']);

        DB::connection('user_db')->table('users')
            ->where('role', 'superadmin')
            ->update(['role' => 'admin']);

        // Set email_verified_at for users with email_verified = true (if column still exists in data)
        // This will be handled by checking if email_verified_at is null and setting it
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('user_db')->table('users', function (Blueprint $table) {
            // Restore removed columns
            $table->string('username', 50)->nullable()->unique()->after('id');
            $table->string('account_no', 50)->nullable()->unique()->after('username');
            $table->enum('department', ['ZCS', 'SBR', 'HBR', 'OMT', 'IPC'])->nullable()->after('role');
            $table->string('position', 100)->nullable()->after('department');
            $table->boolean('email_verified')->default(false)->after('email_verified_at');
            $table->rememberToken()->after('password');

            // Remove new columns
            $table->dropColumn(['is_active', 'deleted_at']);
        });

        // Restore old role enum
        DB::connection('user_db')->statement("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'staff', 'admin', 'superadmin') DEFAULT 'user'");

        // Migrate data back
        DB::connection('user_db')->table('users')
            ->where('role', 'citizen')
            ->update(['role' => 'user']);
    }
};
