<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Get the migration connection name.
     * Uses 'hbr_db' connection for HBR database.
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
        Schema::connection('hbr_db')->create('beneficiary_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_no')->unique();
            $table->foreignId('beneficiary_id')->constrained('beneficiaries')->onDelete('cascade');

            // Application Details
            $table->enum('housing_program', ['socialized_housing', 'relocation', 'rental_subsidy', 'housing_loan']);
            $table->text('application_reason');

            // Eligibility
            $table->enum('eligibility_status', ['pending', 'eligible', 'not_eligible'])->default('pending');
            $table->text('eligibility_remarks')->nullable();

            // Application Status
            $table->enum('application_status', [
                'submitted',
                'under_review',
                'site_visit_scheduled',
                'site_visit_completed',
                'eligible',
                'not_eligible',
                'waitlisted',
                'allocated',
                'cancelled',
            ])->default('submitted');

            $table->text('denial_reason')->nullable();

            // Review/Approval Tracking
            $table->unsignedBigInteger('reviewed_by')->nullable(); // No FK constraint (cross-database)
            $table->timestamp('reviewed_at')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable(); // No FK constraint (cross-database)
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('submitted_at')->useCurrent();

            $table->timestamps();

            // Indexes
            $table->index('application_no');
            $table->index('application_status');
            $table->index('housing_program');
            $table->index('eligibility_status');
            $table->index('beneficiary_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('beneficiary_applications');
    }
};
