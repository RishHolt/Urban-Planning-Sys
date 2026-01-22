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
            // Optional structured address fields
            $table->string('province', 100)->nullable()->after('lot_address');
            $table->string('municipality', 100)->nullable()->after('province');
            $table->string('barangay', 100)->nullable()->after('municipality');
            $table->string('street_name', 255)->nullable()->after('barangay');

            // Indexes for address fields
            $table->index('province');
            $table->index('municipality');
            $table->index('barangay');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->table('clearance_applications', function (Blueprint $table) {
            $table->dropIndex(['province']);
            $table->dropIndex(['municipality']);
            $table->dropIndex(['barangay']);
            $table->dropColumn(['province', 'municipality', 'barangay', 'street_name']);
        });
    }
};
