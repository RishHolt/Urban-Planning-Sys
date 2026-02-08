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
        return 'user_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('user_db')->create('role_module_access', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->string('module_code', 10);
            $table->timestamp('created_at')->nullable();

            $table->primary(['role_id', 'module_code']);
            $table->foreign('module_code')->references('code')->on('modules')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('user_db')->dropIfExists('role_module_access');
    }
};
