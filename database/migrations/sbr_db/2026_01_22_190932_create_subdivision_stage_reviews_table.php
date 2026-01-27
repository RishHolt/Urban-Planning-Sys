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
        Schema::connection('sbr_db')->create('subdivision_stage_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('subdivision_applications')->onDelete('cascade');
            $table->enum('stage', ['concept', 'preliminary', 'improvement', 'final']);
            $table->unsignedBigInteger('reviewer_id'); // No FK constraint (cross-database)
            $table->text('findings')->nullable();
            $table->text('recommendations')->nullable();
            $table->enum('result', ['approved', 'revision_required', 'denied']);
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('application_id', 'idx_stage_application');
            $table->index('stage', 'idx_stage_type');
            $table->index('result', 'idx_stage_result');
            $table->index('reviewer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('sbr_db')->dropIfExists('subdivision_stage_reviews');
    }
};
