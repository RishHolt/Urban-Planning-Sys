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
        Schema::connection('hbr_db')->create('beneficiary_integration_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('housing_beneficiary_id')->nullable()->constrained('housing_beneficiaries')->onDelete('cascade');
            $table->foreignId('household_id')->nullable()->constrained('households')->onDelete('cascade');

            // Integration Information
            $table->enum('integration_type', ['tax_records', 'zoning', 'disaster_resettlement', 'other'])->default('other');
            $table->string('external_record_id');
            $table->string('external_system_name')->nullable();
            $table->text('integration_data')->nullable(); // JSON data from external system

            // Sync Information
            $table->timestamp('last_synced_at')->nullable();
            $table->enum('sync_status', ['success', 'failed', 'pending'])->default('pending');
            $table->text('sync_notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('housing_beneficiary_id');
            $table->index('household_id');
            $table->index('integration_type');
            $table->index('external_record_id');
            $table->index('sync_status');

            // Unique constraint on integration type and external record ID
            $table->unique(['integration_type', 'external_record_id'], 'integration_type_record_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('beneficiary_integration_records');
    }
};
