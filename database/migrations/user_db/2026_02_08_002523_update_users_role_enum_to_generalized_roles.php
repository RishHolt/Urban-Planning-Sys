<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Get the migration connection name.
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
        // First, modify the enum column to include new values (keeping old ones temporarily)
        DB::connection('user_db')->statement("
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('citizen', 'staff', 'admin', 'inspector', 'developer', 'committee_member', 'project_manager', 'engineer', 'user', 'super_admin') NOT NULL DEFAULT 'citizen'
        ");

        // Map old roles to new roles
        DB::connection('user_db')->statement("
            UPDATE users 
            SET role = CASE 
                WHEN role = 'citizen' THEN 'user'
                WHEN role = 'inspector' THEN 'staff'
                WHEN role = 'developer' THEN 'staff'
                WHEN role = 'committee_member' THEN 'staff'
                WHEN role = 'project_manager' THEN 'staff'
                WHEN role = 'engineer' THEN 'staff'
                WHEN role = 'staff' THEN 'staff'
                WHEN role = 'admin' THEN 'admin'
                ELSE 'user'
            END
        ");

        // Now modify the enum to only include new values
        DB::connection('user_db')->statement("
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('user', 'staff', 'admin', 'super_admin') NOT NULL DEFAULT 'user'
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Map new roles back to old roles (approximate mapping)
        DB::connection('user_db')->statement("
            UPDATE users 
            SET role = CASE 
                WHEN role = 'user' THEN 'citizen'
                WHEN role = 'staff' THEN 'staff'
                WHEN role = 'admin' THEN 'admin'
                WHEN role = 'super_admin' THEN 'admin'
                ELSE 'citizen'
            END
        ");

        // Restore the old enum
        DB::connection('user_db')->statement("
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('citizen', 'staff', 'admin', 'inspector', 'developer', 'committee_member', 'project_manager', 'engineer') NOT NULL DEFAULT 'citizen'
        ");
    }
};
