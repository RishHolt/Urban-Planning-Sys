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
        Schema::connection('hbr_db')->create('site_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('beneficiary_id')->constrained('beneficiaries')->onDelete('cascade');
            $table->foreignId('application_id')->constrained('beneficiary_applications')->onDelete('cascade');
            $table->unsignedBigInteger('visited_by'); // No FK constraint (cross-database)

            // Visit Scheduling
            $table->date('scheduled_date');
            $table->date('visit_date')->nullable();

            // Visit Details
            $table->string('address_visited');
            $table->text('living_conditions')->nullable();
            $table->text('findings')->nullable();
            $table->enum('recommendation', ['eligible', 'not_eligible', 'needs_followup'])->nullable();
            $table->text('remarks')->nullable();

            // Status
            $table->enum('status', ['scheduled', 'completed', 'cancelled', 'no_show'])->default('scheduled');

            $table->timestamps();

            // Indexes
            $table->index('beneficiary_id');
            $table->index('application_id');
            $table->index('status');
            $table->index('scheduled_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('site_visits');
    }
};
