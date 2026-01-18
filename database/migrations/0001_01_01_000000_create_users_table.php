<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Get the migration connection name.
     * Uses 'user_db' connection for user database.
     */
    public function getConnection(): ?string
    {
        return 'user_db'; // Use user_db connection (user database)
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('user_db')->create('users', function (Blueprint $table) {
            $table->id();
            $table->string('account_no', 50)->nullable()->unique();
            $table->string('username', 50)->nullable()->unique();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->boolean('email_verified')->default(false);
            $table->string('password');
            $table->enum('role', ['user', 'staff', 'admin', 'superadmin'])->default('user');
            // Department codes:
            // ZCS - Zoning Clearance System
            // SBR - Subdivision & Building Review
            // HBR - Housing Beneficiary Registry
            // OMT - Occupancy Monitoring Tool
            // IPC - Infrastructure Project Coordination
            $table->enum('department', ['ZCS', 'SBR', 'HBR', 'OMT', 'IPC'])->nullable();
            $table->string('position', 100)->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::connection('user_db')->create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::connection('user_db')->create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('user_db')->dropIfExists('users');
        Schema::connection('user_db')->dropIfExists('password_reset_tokens');
        Schema::connection('user_db')->dropIfExists('sessions');
    }
};
