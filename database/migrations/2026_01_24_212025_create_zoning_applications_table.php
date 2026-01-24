<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('zcs_db')->create('zoning_applications', function (Blueprint $table) {
            $table->id();
            
            // User and Service References
            $table->string('user_id', 36);
            $table->string('application_number')->unique();
            $table->string('service_id', 36);
            $table->string('status')->default('pending');
            $table->timestamp('submitted_at')->nullable();
            
            // Applicant Information
            $table->string('applicant_type'); // individual, company
            $table->string('applicant_name')->nullable();
            $table->string('applicant_email');
            $table->string('applicant_contact');
            $table->string('valid_id_path');
            
            // Company Information (if applicable)
            $table->string('company_name')->nullable();
            $table->string('sec_dti_reg_no')->nullable();
            $table->string('authorized_representative')->nullable();
            
            // Property Owner Information
            $table->boolean('is_property_owner')->default(true);
            $table->string('owner_name')->nullable();
            $table->text('owner_address')->nullable();
            $table->string('owner_contact')->nullable();
            
            // Location Details
            $table->string('province');
            $table->string('municipality');
            $table->string('barangay');
            $table->string('lot_no')->nullable();
            $table->string('block_no')->nullable();
            $table->string('street_name')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            // Land Information
            $table->string('land_type'); // residential, commercial, industrial, agricultural, mixed-use
            $table->boolean('has_existing_structure')->default(false);
            $table->integer('number_of_buildings')->default(0);
            $table->decimal('lot_area', 10, 2);
            
            // Application Details
            $table->string('application_type'); // new_classification, reclassification
            $table->string('proposed_use');
            $table->text('project_description');
            $table->text('previous_use')->nullable();
            $table->text('justification')->nullable();
            
            // Legal Declarations
            $table->boolean('declaration_truthfulness')->default(false);
            $table->boolean('agreement_compliance')->default(false);
            $table->boolean('data_privacy_consent')->default(false);
            $table->date('application_date');
            
            // Processing Information
            $table->text('notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->string('reviewed_by', 36)->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->string('approved_by', 36)->nullable();
            $table->timestamp('approved_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('user_id');
            $table->index('status');
            $table->index('application_date');
            $table->index(['province', 'municipality', 'barangay']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zoning_applications');
    }
};
