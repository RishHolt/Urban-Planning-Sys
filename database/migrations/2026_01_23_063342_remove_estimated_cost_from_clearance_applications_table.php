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
        Schema::connection('zcs_db')->table('clearance_applications', function (Blueprint $table) {
            $table->dropColumn('estimated_cost');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->table('clearance_applications', function (Blueprint $table) {
            $table->decimal('estimated_cost', 15, 2)->nullable();
        });
    }
};
