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
        Schema::connection('hbr_db')->create('beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->string('beneficiary_no')->unique();
            $table->unsignedBigInteger('citizen_id')->nullable(); // No FK constraint (cross-database reference to users)

            // Personal Information
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->date('birth_date');
            $table->enum('gender', ['male', 'female']);
            $table->enum('civil_status', ['single', 'married', 'widowed', 'separated', 'live_in']);

            // Contact Information
            $table->string('contact_number');
            $table->string('email')->nullable();

            // Address Information
            $table->string('current_address');
            $table->string('barangay');
            $table->unsignedInteger('years_of_residency');

            // Employment Information
            $table->enum('employment_status', ['employed', 'self_employed', 'unemployed', 'retired', 'student']);
            $table->string('employer_name')->nullable();
            $table->decimal('monthly_income', 12, 2);

            // Property Information
            $table->boolean('has_existing_property')->default(false);

            // Priority Status
            $table->enum('priority_status', ['none', 'pwd', 'senior_citizen', 'solo_parent', 'disaster_victim', 'indigenous'])->default('none');
            $table->string('priority_id_no')->nullable(); // PWD ID, Senior Citizen ID, etc.

            // Status
            $table->boolean('is_active')->default(true);
            $table->timestamp('registered_at')->useCurrent();

            $table->timestamps();

            // Indexes
            $table->index('beneficiary_no');
            $table->index('is_active');
            $table->index('priority_status');
            $table->index('citizen_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('beneficiaries');
    }
};
