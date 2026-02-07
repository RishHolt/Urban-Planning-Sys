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
        return 'hbr_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('hbr_db')->create('application_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('beneficiary_applications')->onDelete('cascade');
            $table->unsignedBigInteger('evaluated_by')->nullable();
            $table->enum('evaluation_type', [
                'initial_review',
                'document_verification',
                'eligibility_check',
                'site_visit',
                'final_review',
                'committee_review',
            ])->default('initial_review');

            // Evaluation details
            $table->text('evaluation_notes')->nullable();
            $table->text('remarks')->nullable();
            $table->json('evaluation_criteria')->nullable(); // Store criteria scores/checks
            $table->enum('recommendation', [
                'approve',
                'reject',
                'conditional',
                'needs_review',
                'request_documents',
            ])->nullable();

            // Scoring (if applicable)
            $table->integer('priority_score')->nullable();
            $table->integer('eligibility_score')->nullable();

            $table->timestamp('evaluated_at')->useCurrent();

            $table->timestamps();

            // Indexes
            $table->index('application_id');
            $table->index('evaluated_by');
            $table->index('evaluation_type');
            $table->index('evaluated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('application_evaluations');
    }
};
