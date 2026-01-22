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
        Schema::connection('hbr_db')->create('households', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('household_head_id')->nullable(); // Reference to housing_beneficiaries

            // Household Information
            $table->string('household_name')->nullable();
            $table->string('household_number')->unique()->nullable(); // Auto-generated identifier

            // Contact Information
            $table->string('primary_contact_email')->nullable();
            $table->string('primary_contact_mobile');
            $table->string('primary_contact_telephone')->nullable();

            // Address Information
            $table->text('address');
            $table->string('street')->nullable();
            $table->string('barangay');
            $table->string('city');
            $table->string('province');
            $table->string('zip_code')->nullable();

            // Household Details
            $table->integer('household_size')->default(1);
            $table->integer('number_of_dependents')->default(0);
            $table->decimal('total_monthly_income', 12, 2)->nullable();

            // Status
            $table->enum('status', ['active', 'inactive', 'archived'])->default('active');

            $table->timestamps();

            // Indexes
            $table->index('household_head_id');
            $table->index('household_number');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('households');
    }
};
