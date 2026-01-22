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
        Schema::connection('hbr_db')->create('blacklist', function (Blueprint $table) {
            $table->id();
            $table->foreignId('beneficiary_id')->constrained('beneficiaries')->onDelete('cascade');

            // Blacklist Details
            $table->enum('reason', [
                'fraud',
                'abandoned_unit',
                'non_payment',
                'subletting',
                'criminal_activity',
                'property_damage',
                'duplicate_benefit',
                'other',
            ]);
            $table->text('details');

            // Dates
            $table->date('blacklisted_date');
            $table->date('lifted_date')->nullable();

            // Status
            $table->enum('status', ['active', 'lifted'])->default('active');

            // Tracking
            $table->unsignedBigInteger('blacklisted_by'); // No FK constraint (cross-database)
            $table->unsignedBigInteger('lifted_by')->nullable(); // No FK constraint (cross-database)
            $table->text('lift_remarks')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('beneficiary_id');
            $table->index('status');
            $table->index('reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('blacklist');
    }
};
