<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Get the migration connection name.
     * Uses 'user_db' connection for notifications.
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
        Schema::connection('user_db')->create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // No FK constraint (cross-database)
            $table->string('type'); // e.g., 'application_status_change', 'document_request', 'application_approved', 'application_rejected'
            $table->string('title');
            $table->text('message');
            $table->string('resource_type')->nullable(); // e.g., 'housing_beneficiary_application'
            $table->unsignedBigInteger('resource_id')->nullable(); // ID of the related resource
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('is_read');
            $table->index(['resource_type', 'resource_id']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('user_db')->dropIfExists('notifications');
    }
};
