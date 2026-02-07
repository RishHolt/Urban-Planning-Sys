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
     * Check if an index exists on a table.
     */
    private function hasIndex(string $table, string $index): bool
    {
        $connection = Schema::connection('hbr_db')->getConnection();
        $indexes = $connection->select("SHOW INDEXES FROM {$table} WHERE Key_name = ?", [$index]);

        return count($indexes) > 0;
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('hbr_db')->table('beneficiary_applications', function (Blueprint $table) {
            // Project linkage
            if (! Schema::connection('hbr_db')->hasColumn('beneficiary_applications', 'project_id')) {
                $table->foreignId('project_id')->nullable()->after('beneficiary_id')
                    ->constrained('housing_projects')->onDelete('set null');
            }

            // Application type
            if (! Schema::connection('hbr_db')->hasColumn('beneficiary_applications', 'application_type')) {
                $table->enum('application_type', ['individual', 'household'])->default('individual')
                    ->after('housing_program');
            }

            // Case officer assignment
            if (! Schema::connection('hbr_db')->hasColumn('beneficiary_applications', 'case_officer_id')) {
                $table->unsignedBigInteger('case_officer_id')->nullable()->after('beneficiary_id');
            }
            if (! $this->hasIndex('beneficiary_applications', 'beneficiary_applications_case_officer_id_index')) {
                $table->index('case_officer_id');
            }

            // Additional notes and remarks
            if (! Schema::connection('hbr_db')->hasColumn('beneficiary_applications', 'application_notes')) {
                $table->text('application_notes')->nullable()->after('denial_reason');
            }
            if (! Schema::connection('hbr_db')->hasColumn('beneficiary_applications', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('application_notes');
            }
            if (! Schema::connection('hbr_db')->hasColumn('beneficiary_applications', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('denial_reason');
            }

            // Eligibility criteria tracking
            if (! Schema::connection('hbr_db')->hasColumn('beneficiary_applications', 'eligibility_criteria_met')) {
                $table->boolean('eligibility_criteria_met')->default(false)->after('eligibility_remarks');
            }
            if (! Schema::connection('hbr_db')->hasColumn('beneficiary_applications', 'special_considerations')) {
                $table->text('special_considerations')->nullable()->after('eligibility_criteria_met');
            }

            // Update application_status enum to match ApplicationStatus enum
            $table->enum('application_status', [
                'submitted',
                'under_review',
                'verified',
                'approved',
                'rejected',
                'cancelled',
                // Legacy statuses for backward compatibility
                'site_visit_scheduled',
                'site_visit_completed',
                'eligible',
                'not_eligible',
                'waitlisted',
                'allocated',
            ])->default('submitted')->change();

            // Update eligibility_status enum to include conditional
            $table->enum('eligibility_status', [
                'pending',
                'eligible',
                'not_eligible',
                'conditional',
            ])->default('pending')->change();

            // Indexes
            if (! $this->hasIndex('beneficiary_applications', 'beneficiary_applications_project_id_index')) {
                $table->index('project_id');
            }
            if (! $this->hasIndex('beneficiary_applications', 'beneficiary_applications_case_officer_id_index')) {
                $table->index('case_officer_id');
            }
            if (! $this->hasIndex('beneficiary_applications', 'beneficiary_applications_application_type_index')) {
                $table->index('application_type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->table('beneficiary_applications', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropColumn([
                'project_id',
                'application_type',
                'case_officer_id',
                'application_notes',
                'admin_notes',
                'rejection_reason',
                'eligibility_criteria_met',
                'special_considerations',
            ]);

            // Revert enum changes
            $table->enum('application_status', [
                'submitted',
                'under_review',
                'site_visit_scheduled',
                'site_visit_completed',
                'eligible',
                'not_eligible',
                'waitlisted',
                'allocated',
                'cancelled',
            ])->default('submitted')->change();

            $table->enum('eligibility_status', [
                'pending',
                'eligible',
                'not_eligible',
            ])->default('pending')->change();
        });
    }
};
