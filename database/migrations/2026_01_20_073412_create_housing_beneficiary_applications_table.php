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
        Schema::connection('hbr_db')->create('housing_beneficiary_applications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // No FK constraint (cross-database)

            // Application Information
            $table->string('application_number')->unique();
            $table->enum('application_type', ['individual', 'household'])->default('individual');

            // Links to beneficiary/household
            $table->foreignId('housing_beneficiary_id')->nullable()->constrained('housing_beneficiaries')->onDelete('cascade');
            $table->foreignId('household_id')->nullable()->constrained('households')->onDelete('cascade');

            // Status workflow: draft → submitted → under_review → approved → rejected
            $table->enum('status', ['draft', 'submitted', 'under_review', 'approved', 'rejected'])->default('draft');

            // Dates
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('approved_at')->nullable();

            // Review/Approval tracking
            $table->unsignedBigInteger('reviewed_by')->nullable(); // No FK constraint (cross-database)
            $table->unsignedBigInteger('approved_by')->nullable(); // No FK constraint (cross-database)

            // Application Details
            $table->text('application_notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('admin_notes')->nullable();

            // Eligibility Information (can be stored here or referenced from beneficiary)
            $table->text('eligibility_criteria_met')->nullable();
            $table->text('special_considerations')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('application_number');
            $table->index('status');
            $table->index('housing_beneficiary_id');
            $table->index('household_id');
            $table->index('submitted_at');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('housing_beneficiary_applications');
    }
};
