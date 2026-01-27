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
        Schema::connection('hbr_db')->create('complaints', function (Blueprint $table) {
            $table->id();
            $table->string('complaint_no')->unique();
            $table->foreignId('allocation_id')->constrained('allocations')->onDelete('cascade');
            $table->foreignId('beneficiary_id')->constrained('beneficiaries')->onDelete('cascade');
            $table->foreignId('unit_id')->constrained('housing_units')->onDelete('cascade');

            // Complaint Details
            $table->enum('complaint_type', [
                'maintenance',
                'neighbor_dispute',
                'payment_issue',
                'violation',
                'documentation',
                'relocation_request',
                'other',
            ]);
            $table->text('description');

            // Priority and Status
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['open', 'in_progress', 'resolved', 'closed'])->default('open');

            // Resolution
            $table->text('resolution')->nullable();
            $table->unsignedBigInteger('assigned_to')->nullable(); // No FK constraint (cross-database)
            $table->unsignedBigInteger('resolved_by')->nullable(); // No FK constraint (cross-database)
            $table->timestamp('resolved_at')->nullable();

            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();

            // Indexes
            $table->index('complaint_no');
            $table->index('allocation_id');
            $table->index('beneficiary_id');
            $table->index('status');
            $table->index('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('complaints');
    }
};
