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
        return 'sbr_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('sbr_db')->create('subdivision_applications', function (Blueprint $table) {
            $table->id();
            $table->string('reference_no', 20)->unique();
            $table->unsignedBigInteger('user_id'); // No FK constraint (cross-database)
            $table->string('zoning_clearance_no', 30); // Reference to Zoning Clearance System
            $table->enum('applicant_type', ['developer', 'authorized_rep']);
            $table->string('contact_number', 20);
            $table->string('contact_email', 100)->nullable();
            $table->decimal('pin_lat', 10, 8);
            $table->decimal('pin_lng', 11, 8);
            $table->string('project_address', 255);
            $table->string('developer_name', 150);
            $table->string('subdivision_name', 150);
            $table->text('project_description')->nullable();
            $table->decimal('total_area_sqm', 12, 2);
            $table->integer('total_lots_planned');
            $table->decimal('open_space_percentage', 5, 2);
            $table->enum('current_stage', ['concept', 'preliminary', 'improvement', 'final'])->default('concept');
            $table->enum('status', [
                'submitted',
                'concept_review',
                'preliminary_review',
                'improvement_review',
                'final_review',
                'approved',
                'denied',
                'revision',
            ])->default('submitted');
            $table->text('denial_reason')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('reference_no', 'idx_subdivision_ref');
            $table->index('zoning_clearance_no', 'idx_subdivision_zoning');
            $table->index('current_stage', 'idx_subdivision_stage');
            $table->index('status', 'idx_subdivision_status');
            $table->index('user_id', 'idx_subdivision_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('sbr_db')->dropIfExists('subdivision_applications');
    }
};
