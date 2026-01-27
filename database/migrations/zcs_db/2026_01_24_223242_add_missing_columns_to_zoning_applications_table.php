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
            // Mapping existing to new if necessary, but here we just add what's missing
            if (!Schema::connection('zcs_db')->hasColumn('zoning_applications', 'reference_no')) {
                $table->string('reference_no', 20)->unique()->after('application_number');
            }
            if (!Schema::connection('zcs_db')->hasColumn('zoning_applications', 'zone_id')) {
                $table->unsignedBigInteger('zone_id')->nullable()->after('service_id');
            }
            
            // Applicant Info additions
            $table->boolean('is_representative')->default(false)->after('applicant_type');
            $table->string('representative_name', 150)->nullable()->after('is_representative');
            
            // Prerequisites
            $table->string('tax_dec_ref_no', 50)->nullable()->after('applicant_contact');
            $table->string('barangay_permit_ref_no', 50)->nullable()->after('tax_dec_ref_no');
            
            // Contact info (matches or adds to applicant_contact/email)
            $table->string('contact_number', 20)->nullable()->after('applicant_contact');
            $table->string('contact_email', 100)->nullable()->after('applicant_email');
            
            // Location
            $table->string('lot_address', 255)->nullable()->after('longitude');
            $table->string('lot_owner', 150)->nullable()->after('lot_address');
            $table->string('lot_owner_contact_number', 20)->nullable()->after('lot_owner');
            $table->string('lot_owner_contact_email', 100)->nullable()->after('lot_owner_contact_number');
            
            // Land Info
            $table->decimal('lot_area_total', 12, 2)->nullable()->after('lot_area');
            $table->decimal('lot_area_used', 12, 2)->nullable()->after('lot_area_total');
            $table->boolean('is_subdivision')->default(false)->after('lot_area_used');
            $table->string('subdivision_name', 100)->nullable()->after('is_subdivision');
            $table->integer('total_lots_planned')->nullable()->after('subdivision_name');
            $table->boolean('has_subdivision_plan')->default(false)->after('total_lots_planned');
            
            // Project Details
            $table->string('building_type', 100)->nullable()->after('proposed_use');
            $table->integer('number_of_storeys')->nullable()->after('building_type');
            $table->decimal('floor_area_sqm', 10, 2)->nullable()->after('number_of_storeys');
            $table->integer('number_of_units')->nullable()->after('floor_area_sqm');
            $table->text('purpose')->nullable()->after('number_of_units');
            
            // Fees & Status
            $table->decimal('assessed_fee', 10, 2)->nullable()->after('purpose');
            $table->boolean('is_active')->default(true)->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->table('zoning_applications', function (Blueprint $table) {
            $table->dropColumn([
                'reference_no', 'zone_id', 'is_representative', 'representative_name',
                'tax_dec_ref_no', 'barangay_permit_ref_no', 'contact_number', 'contact_email',
                'lot_address', 'lot_owner', 'lot_owner_contact_number', 'lot_owner_contact_email',
                'lot_area_total', 'lot_area_used', 'is_subdivision', 'subdivision_name',
                'total_lots_planned', 'has_subdivision_plan', 'building_type',
                'number_of_storeys', 'floor_area_sqm', 'number_of_units', 'purpose',
                'assessed_fee', 'is_active'
            ]);
        });
    }
};
