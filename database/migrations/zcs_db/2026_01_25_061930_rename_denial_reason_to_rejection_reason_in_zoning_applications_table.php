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
            if (Schema::connection('zcs_db')->hasColumn('zoning_applications', 'denial_reason')) {
                $table->renameColumn('denial_reason', 'rejection_reason');
            } else if (!Schema::connection('zcs_db')->hasColumn('zoning_applications', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->table('zoning_applications', function (Blueprint $table) {
            if (Schema::connection('zcs_db')->hasColumn('zoning_applications', 'rejection_reason')) {
                $table->renameColumn('rejection_reason', 'denial_reason');
            }
        });
    }
};
