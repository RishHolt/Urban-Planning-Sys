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
        return 'hbr_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('hbr_db')->table('beneficiaries', function (Blueprint $table) {
            // Additional name fields
            $table->string('suffix')->nullable()->after('last_name');

            // Additional contact fields
            $table->string('mobile_number')->nullable()->after('contact_number');
            $table->string('telephone_number')->nullable()->after('mobile_number');

            // Additional address fields
            $table->string('address')->nullable()->after('current_address');
            $table->string('street')->nullable()->after('address');
            $table->string('city')->nullable()->after('barangay');
            $table->string('province')->nullable()->after('city');
            $table->string('zip_code')->nullable()->after('province');

            // Additional employment fields
            $table->string('occupation')->nullable()->after('employment_status');

            // Additional income field
            $table->decimal('household_income', 12, 2)->nullable()->after('monthly_income');

            // ID fields
            $table->string('id_type')->nullable()->after('priority_id_no');
            $table->string('id_number')->nullable()->after('id_type');

            // Sector classification
            $table->json('sector_tags')->nullable()->after('priority_id_no');

            // Beneficiary status
            $table->enum('beneficiary_status', [
                'applicant',
                'qualified',
                'waitlisted',
                'awarded',
                'disqualified',
                'archived',
            ])->default('applicant')->after('is_active');

            // Special eligibility notes
            $table->text('special_eligibility_notes')->nullable()->after('beneficiary_status');

            // Archive tracking
            $table->timestamp('archived_at')->nullable()->after('registered_at');

            // Indexes
            $table->index('beneficiary_status');
            $table->index('archived_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->table('beneficiaries', function (Blueprint $table) {
            $table->dropColumn([
                'suffix',
                'mobile_number',
                'telephone_number',
                'address',
                'street',
                'city',
                'province',
                'zip_code',
                'occupation',
                'household_income',
                'id_type',
                'id_number',
                'sector_tags',
                'beneficiary_status',
                'special_eligibility_notes',
                'archived_at',
            ]);
        });
    }
};
