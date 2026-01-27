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
        // Modify the enum to add new roles
        DB::connection('user_db')->statement("ALTER TABLE users MODIFY COLUMN role ENUM('citizen', 'staff', 'admin', 'inspector', 'developer', 'committee_member', 'project_manager', 'engineer') DEFAULT 'citizen'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original enum values
        DB::connection('user_db')->statement("ALTER TABLE users MODIFY COLUMN role ENUM('citizen', 'staff', 'admin', 'inspector', 'developer', 'committee_member') DEFAULT 'citizen'");
    }
};
