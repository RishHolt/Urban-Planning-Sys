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
        Schema::connection('hbr_db')->create('housing_beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable(); // No FK constraint (cross-database)

            // Personal Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('suffix')->nullable();
            $table->date('birth_date');
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('civil_status')->nullable();

            // Contact Information
            $table->string('email')->nullable();
            $table->string('mobile_number');
            $table->string('telephone_number')->nullable();

            // Address Information
            $table->text('address');
            $table->string('street')->nullable();
            $table->string('barangay');
            $table->string('city');
            $table->string('province');
            $table->string('zip_code')->nullable();

            // Identification
            $table->string('id_type')->nullable(); // e.g., 'philhealth', 'sss', 'tin', 'passport'
            $table->string('id_number')->nullable();

            // Income/Employment Information
            $table->enum('employment_status', ['employed', 'unemployed', 'self_employed', 'retired', 'student', 'other'])->nullable();
            $table->string('occupation')->nullable();
            $table->string('employer_name')->nullable();
            $table->decimal('monthly_income', 12, 2)->nullable();
            $table->decimal('household_income', 12, 2)->nullable();

            // Eligibility Criteria
            $table->boolean('is_indigent')->default(false);
            $table->boolean('is_senior_citizen')->default(false);
            $table->boolean('is_pwd')->default(false);
            $table->boolean('is_single_parent')->default(false);
            $table->boolean('is_victim_of_disaster')->default(false);
            $table->text('special_eligibility_notes')->nullable();

            // Status
            $table->enum('status', ['active', 'inactive', 'archived'])->default('active');

            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('email');
            $table->index('mobile_number');
            $table->index('status');
            $table->index(['last_name', 'first_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('housing_beneficiaries');
    }
};
