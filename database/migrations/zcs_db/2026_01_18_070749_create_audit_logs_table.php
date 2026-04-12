<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Get the migration connection name.
     * Uses 'zcs_db' connection for user database.
     */
    public function getConnection(): ?string
    {
        return 'zcs_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('zcs_db')->create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('action', 100);
            $table->string('resource_type', 100);
            $table->string('resource_id', 100)->nullable();
            $table->json('changes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('resource_type');
            $table->index('resource_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->dropIfExists('audit_logs');
    }
};
