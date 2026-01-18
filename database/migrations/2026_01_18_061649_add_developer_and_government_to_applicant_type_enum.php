<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::connection('zcs_db')->statement(
            "ALTER TABLE zoning_applications MODIFY COLUMN applicant_type ENUM('individual', 'company', 'developer', 'Government') NOT NULL"
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::connection('zcs_db')->statement(
            "ALTER TABLE zoning_applications MODIFY COLUMN applicant_type ENUM('individual', 'company') NOT NULL"
        );
    }
};
