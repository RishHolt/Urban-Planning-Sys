<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('zcs_db')->create('zoning_application_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zoning_application_id')->constrained('zoning_applications')->onDelete('cascade');
            $table->enum('status_from', ['pending', 'in_review', 'approved', 'rejected'])->nullable();
            $table->enum('status_to', ['pending', 'in_review', 'approved', 'rejected']);
            $table->unsignedBigInteger('changed_by'); // No FK constraint (cross-database)
            $table->text('notes')->nullable();
            $table->timestamp('created_at');

            // Indexes
            $table->index('zoning_application_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->dropIfExists('zoning_application_status_history');
    }
};
