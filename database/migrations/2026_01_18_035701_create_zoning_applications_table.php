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
            // Key Fields
            $table->id();
            $table->unsignedBigInteger('user_id'); // No FK constraint (cross-database)
            $table->string('application_number')->unique();
            $table->string('service_id')->default('zoning-clearance');
            $table->enum('status', ['pending', 'in_review', 'approved', 'rejected'])->default('pending');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            // Step 1: Applicant Information
            $table->enum('applicant_type', ['individual', 'company', 'developer', 'Government']);
            $table->string('applicant_name');
            $table->string('applicant_email');
            $table->string('applicant_contact');
            $table->string('valid_id_path')->nullable();
            $table->string('company_name')->nullable();
            $table->string('sec_dti_reg_no')->nullable();
            $table->string('authorized_representative')->nullable();
            $table->boolean('is_property_owner')->default(false);
            // authorization_letter_path - moved to zoning_application_documents table

            // Step 2: Property Owner Information
            $table->string('owner_name')->nullable();
            $table->text('owner_address')->nullable();
            $table->string('owner_contact')->nullable();
            // proof_of_ownership_path - moved to zoning_application_documents table
            // tax_declaration_type, tax_declaration_id, tax_declaration_path - moved to zoning_application_documents table

            // Step 3: Property Location
            $table->string('province');
            $table->string('municipality');
            $table->string('barangay');
            $table->string('lot_no')->nullable();
            $table->string('block_no')->nullable();
            $table->string('street_name')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Step 4: Land & Property Details
            $table->string('land_type');
            $table->boolean('has_existing_structure')->default(false);
            $table->integer('number_of_buildings')->nullable();
            $table->decimal('lot_area', 10, 2);

            // Step 5: Proposed Development
            $table->enum('application_type', ['new_construction', 'renovation', 'change_of_use', 'others']);
            $table->enum('proposed_use', ['residential', 'commercial', 'mixed_use', 'institutional']);
            $table->text('project_description')->nullable();
            // estimated_cost and expected_start_date removed - not needed
            // site_development_plan_path - moved to zoning_application_documents table
            $table->string('previous_use')->nullable();
            $table->text('justification')->nullable();

            // Step 6: Documents (all moved to zoning_application_documents table)
            // location_map_path, vicinity_map_path - moved to zoning_application_documents table
            // barangay_clearance_type, barangay_clearance_id, barangay_clearance_path - moved to zoning_application_documents table
            // signature_path - moved to zoning_application_documents table

            // Step 7: Declarations
            $table->boolean('declaration_truthfulness')->default(false);
            $table->boolean('agreement_compliance')->default(false);
            $table->boolean('data_privacy_consent')->default(false);
            $table->date('application_date');

            // Additional Fields
            $table->text('notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable(); // No FK constraint (cross-database)
            $table->timestamp('reviewed_at')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable(); // No FK constraint (cross-database)
            $table->timestamp('approved_at')->nullable();

            // Indexes
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->dropIfExists('zoning_applications');
    }
};
