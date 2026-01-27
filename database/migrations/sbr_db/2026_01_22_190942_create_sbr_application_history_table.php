<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Get the migration connection name.
     */
    public function getConnection(): ?string
    {
        return 'sbr_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('sbr_db')->create('application_history', function (Blueprint $table) {
            $table->id();
            $table->enum('application_type', ['subdivision', 'building']);
            $table->unsignedBigInteger('application_id');
            $table->enum('status', [
                'submitted',
                'concept_review',
                'preliminary_review',
                'improvement_review',
                'final_review',
                'approved',
                'denied',
                'revision',
                'fetched',
                'under_review',
                'posted',
            ]);
            $table->text('remarks')->nullable();
            $table->unsignedBigInteger('updated_by'); // No FK constraint (cross-database)
            $table->timestamp('updated_at');

            // Indexes
            $table->index('application_id', 'idx_history_application');
            $table->index('application_type', 'idx_history_type');
            $table->index('status', 'idx_history_status');
            $table->index('updated_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('sbr_db')->dropIfExists('application_history');
    }
};
