<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Get the migration connection name.
     */
    public function getConnection(): ?string
    {
        return 'zcs_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('zcs_db')->create('clearance_applications', function (Blueprint $table) {
            // Basic Info
            $table->id();
            $table->string('reference_no', 20)->unique();
            $table->unsignedBigInteger('user_id'); // No FK constraint (cross-database)
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->enum('application_category', ['individual_lot', 'subdivision_development']);

            // Applicant Info
            $table->enum('applicant_type', ['owner', 'authorized_rep', 'contractor']);
            $table->string('contact_number', 20);
            $table->string('contact_email', 100)->nullable();

            // Prerequisites (API Verified)
            $table->string('tax_dec_ref_no', 50);
            $table->string('barangay_permit_ref_no', 50);

            // Location (Pin)
            $table->decimal('pin_lat', 10, 8);
            $table->decimal('pin_lng', 11, 8);

            // Property Info
            $table->string('lot_address', 255);
            $table->string('lot_owner', 150);
            $table->decimal('lot_area_total', 12, 2);

            // Subdivision Info
            $table->boolean('is_subdivision')->default(false);
            $table->string('subdivision_name', 100)->nullable();
            $table->string('block_no', 20)->nullable();
            $table->string('lot_no', 20)->nullable();
            $table->integer('total_lots_planned')->nullable();
            $table->boolean('has_subdivision_plan')->default(false);

            // Project Details
            $table->enum('land_use_type', ['residential', 'commercial', 'industrial', 'agricultural', 'institutional', 'mixed_use']);
            $table->enum('project_type', ['new_construction', 'renovation', 'addition', 'change_of_use']);
            $table->string('building_type', 100)->nullable();
            $table->text('project_description');
            $table->enum('existing_structure', ['none', 'existing_to_retain', 'existing_to_demolish', 'existing_to_renovate']);
            $table->integer('number_of_storeys')->nullable();
            $table->decimal('floor_area_sqm', 10, 2)->nullable();
            $table->decimal('estimated_cost', 15, 2)->nullable();
            $table->text('purpose');

            // Fees & Status
            $table->decimal('assessed_fee', 10, 2)->nullable();
            $table->enum('status', ['pending', 'under_review', 'for_inspection', 'approved', 'denied'])->default('pending');
            $table->text('denial_reason')->nullable();

            // System
            $table->boolean('is_active')->default(true);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('zone_id');
            $table->index('application_category');
            $table->index('status');
            $table->index('is_subdivision');
            $table->index(['pin_lat', 'pin_lng']);
            $table->index('tax_dec_ref_no');
            $table->index('barangay_permit_ref_no');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->dropIfExists('clearance_applications');
    }
};
