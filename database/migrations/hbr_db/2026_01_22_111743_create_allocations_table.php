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
        Schema::connection('hbr_db')->create('allocations', function (Blueprint $table) {
            $table->id();
            $table->string('allocation_no')->unique();
            $table->foreignId('beneficiary_id')->constrained('beneficiaries')->onDelete('cascade');
            $table->foreignId('application_id')->constrained('beneficiary_applications')->onDelete('cascade');
            $table->foreignId('unit_id')->constrained('housing_units')->onDelete('cascade');

            // Allocation Dates
            $table->date('allocation_date');
            $table->date('acceptance_deadline');
            $table->date('accepted_date')->nullable();
            $table->date('move_in_date')->nullable();

            // Allocation Status
            $table->enum('allocation_status', [
                'proposed',
                'committee_review',
                'approved',
                'rejected',
                'accepted',
                'declined',
                'cancelled',
                'moved_in',
            ])->default('proposed');

            // Contract Details
            $table->decimal('total_contract_price', 12, 2);
            $table->decimal('monthly_amortization', 12, 2);
            $table->unsignedInteger('amortization_months');
            $table->text('special_conditions')->nullable();
            $table->string('contract_file_path')->nullable();
            $table->date('contract_signed_date')->nullable();

            // Approval Tracking
            $table->unsignedBigInteger('allocated_by')->nullable(); // No FK constraint (cross-database)
            $table->unsignedBigInteger('approved_by')->nullable(); // No FK constraint (cross-database)

            $table->timestamps();

            // Indexes
            $table->index('allocation_no');
            $table->index('beneficiary_id');
            $table->index('unit_id');
            $table->index('allocation_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('allocations');
    }
};
