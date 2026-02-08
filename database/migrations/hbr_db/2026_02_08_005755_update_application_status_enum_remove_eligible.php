<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
        // First, migrate existing data
        DB::connection('hbr_db')
            ->table('beneficiary_applications')
            ->where('application_status', 'eligible')
            ->update(['application_status' => 'verified']);

        DB::connection('hbr_db')
            ->table('beneficiary_applications')
            ->where('application_status', 'not_eligible')
            ->update(['application_status' => 'rejected']);

        // Update the enum to remove 'eligible' and 'not_eligible'
        Schema::connection('hbr_db')->table('beneficiary_applications', function (Blueprint $table) {
            $table->enum('application_status', [
                'submitted',
                'under_review',
                'site_visit_scheduled',
                'site_visit_completed',
                'verified',
                'approved',
                'rejected',
                'waitlisted',
                'allocated',
                'cancelled',
            ])->default('submitted')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert data changes
        DB::connection('hbr_db')
            ->table('beneficiary_applications')
            ->where('application_status', 'verified')
            ->where('eligibility_status', 'eligible')
            ->update(['application_status' => 'eligible']);

        DB::connection('hbr_db')
            ->table('beneficiary_applications')
            ->where('application_status', 'rejected')
            ->where('eligibility_status', 'not_eligible')
            ->update(['application_status' => 'not_eligible']);

        // Restore the enum with legacy values
        Schema::connection('hbr_db')->table('beneficiary_applications', function (Blueprint $table) {
            $table->enum('application_status', [
                'submitted',
                'under_review',
                'site_visit_scheduled',
                'site_visit_completed',
                'verified',
                'approved',
                'rejected',
                'eligible',
                'not_eligible',
                'waitlisted',
                'allocated',
                'cancelled',
            ])->default('submitted')->change();
        });
    }
};
