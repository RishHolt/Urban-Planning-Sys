<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
        Schema::connection('zcs_db')->table('zones', function (Blueprint $table) {
            // Add boundary_type enum column (nullable, defaults to 'zoning')
            $table->enum('boundary_type', ['municipal', 'barangay', 'zoning'])
                ->nullable()
                ->default('zoning')
                ->after('is_active');
        });

        // Migrate existing data: is_municipality = true → boundary_type = 'municipal'
        DB::connection('zcs_db')->table('zones')
            ->where('is_municipality', true)
            ->update(['boundary_type' => 'municipal']);

        // Set all other zones to 'zoning' (should already be default, but ensure)
        DB::connection('zcs_db')->table('zones')
            ->whereNull('boundary_type')
            ->update(['boundary_type' => 'zoning']);

        // Now drop is_municipality column
        Schema::connection('zcs_db')->table('zones', function (Blueprint $table) {
            $table->dropIndex(['is_municipality']);
            $table->dropColumn('is_municipality');
        });

        // Add index on boundary_type
        Schema::connection('zcs_db')->table('zones', function (Blueprint $table) {
            $table->index('boundary_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->table('zones', function (Blueprint $table) {
            // Re-add is_municipality column
            $table->boolean('is_municipality')->default(false)->after('is_active');
        });

        // Migrate data back: boundary_type = 'municipal' → is_municipality = true
        DB::connection('zcs_db')->table('zones')
            ->where('boundary_type', 'municipal')
            ->update(['is_municipality' => true]);

        // Drop boundary_type
        Schema::connection('zcs_db')->table('zones', function (Blueprint $table) {
            $table->dropIndex(['boundary_type']);
            $table->dropColumn('boundary_type');
        });

        // Add index back
        Schema::connection('zcs_db')->table('zones', function (Blueprint $table) {
            $table->index('is_municipality');
        });
    }
};
