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
        Schema::connection('zcs_db')->table('zoning_applications', function (Blueprint $table) {
            // Make location columns nullable
            $table->string('province')->nullable()->change();
            $table->string('municipality')->nullable()->change();
            $table->string('barangay')->nullable()->change();
            
            // Other columns that might be null in the new flow
            $table->string('land_use_type')->nullable()->change();
            $table->string('applicant_email')->nullable()->change();
            $table->string('applicant_contact')->nullable()->change();
            $table->string('valid_id_path')->nullable()->change();
            $table->decimal('lot_area', 10, 2)->nullable()->change();
            $table->string('application_type')->nullable()->change();
            $table->string('proposed_use')->nullable()->change();
            $table->text('project_description')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->table('zoning_applications', function (Blueprint $table) {
            $table->string('province')->nullable(false)->change();
            $table->string('municipality')->nullable(false)->change();
            $table->string('barangay')->nullable(false)->change();
            $table->string('land_use_type')->nullable(false)->change();
            $table->string('applicant_email')->nullable(false)->change();
            $table->string('applicant_contact')->nullable(false)->change();
            $table->string('valid_id_path')->nullable(false)->change();
            $table->decimal('lot_area', 10, 2)->nullable(false)->change();
            $table->string('application_type')->nullable(false)->change();
            $table->string('proposed_use')->nullable(false)->change();
            $table->text('project_description')->nullable(false)->change();
        });
    }
};
