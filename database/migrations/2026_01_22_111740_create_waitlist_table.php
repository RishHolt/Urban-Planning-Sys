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
        Schema::connection('hbr_db')->create('waitlist', function (Blueprint $table) {
            $table->id();
            $table->foreignId('beneficiary_id')->constrained('beneficiaries')->onDelete('cascade');
            $table->foreignId('application_id')->constrained('beneficiary_applications')->onDelete('cascade');

            // Waitlist Details
            $table->enum('housing_program', ['socialized_housing', 'relocation', 'rental_subsidy', 'housing_loan']);
            $table->unsignedInteger('priority_score');
            $table->unsignedInteger('queue_position');
            $table->date('waitlist_date')->useCurrent();

            // Status
            $table->enum('status', ['active', 'allocated', 'removed', 'expired'])->default('active');

            $table->timestamps();

            // Indexes
            $table->index('beneficiary_id');
            $table->index('housing_program');
            $table->index('priority_score');
            $table->index('queue_position');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('waitlist');
    }
};
