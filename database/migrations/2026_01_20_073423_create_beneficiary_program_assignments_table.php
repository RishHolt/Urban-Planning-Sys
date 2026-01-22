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
        Schema::connection('hbr_db')->create('beneficiary_program_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('housing_beneficiary_id')->nullable()->constrained('housing_beneficiaries')->onDelete('cascade');
            $table->foreignId('household_id')->nullable()->constrained('households')->onDelete('cascade');
            $table->foreignId('housing_program_id')->constrained('housing_programs')->onDelete('cascade');

            // Assignment Details
            $table->date('assigned_date');
            $table->enum('status', ['pending', 'active', 'completed', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();

            // Assignment tracking
            $table->unsignedBigInteger('assigned_by')->nullable(); // No FK constraint (cross-database)

            $table->timestamps();

            // Indexes
            $table->index('housing_beneficiary_id');
            $table->index('household_id');
            $table->index('housing_program_id');
            $table->index('status');

            // Note: Application-level validation should ensure either beneficiary or household is set, but not both
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('beneficiary_program_assignments');
    }
};
