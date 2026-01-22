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
        // Step 1: Add zoning_classification_id column as nullable first
        Schema::connection('zcs_db')->table('zones', function (Blueprint $table) {
            $table->unsignedBigInteger('zoning_classification_id')->nullable()->after('id');
        });

        // Step 2: Migrate existing data: create classifications from existing zones
        $this->migrateExistingZonesToClassifications();

        // Step 3: Remove unique constraint on code (multiple zones can have same classification)
        Schema::connection('zcs_db')->table('zones', function (Blueprint $table) {
            $table->dropUnique(['code']);
        });

        // Step 4: Remove old columns and add new ones
        Schema::connection('zcs_db')->table('zones', function (Blueprint $table) {
            // Remove code, name, description, allowed_uses, color from zones
            // These will come from the classification
            $table->dropColumn(['code', 'name', 'description', 'allowed_uses', 'color']);

            // Make zoning_classification_id required
            $table->unsignedBigInteger('zoning_classification_id')->nullable(false)->change();

            // Add a label field for identifying specific zone instances (optional)
            $table->string('label', 100)->nullable()->after('zoning_classification_id');

            // Add foreign key
            $table->foreign('zoning_classification_id')
                ->references('id')
                ->on('zcs_db.zoning_classifications')
                ->onDelete('restrict');

            $table->index('zoning_classification_id');
        });
    }

    /**
     * Migrate existing zones to create classifications and link them.
     */
    private function migrateExistingZonesToClassifications(): void
    {
        $zones = DB::connection('zcs_db')->table('zones')->get();

        foreach ($zones as $zone) {
            // Check if classification already exists
            $classification = DB::connection('zcs_db')
                ->table('zoning_classifications')
                ->where('code', $zone->code)
                ->first();

            if (! $classification) {
                // Create new classification
                $classificationId = DB::connection('zcs_db')->table('zoning_classifications')->insertGetId([
                    'code' => $zone->code,
                    'name' => $zone->name,
                    'description' => $zone->description,
                    'allowed_uses' => $zone->allowed_uses,
                    'color' => $zone->color,
                    'is_active' => $zone->is_active,
                    'created_at' => $zone->created_at,
                    'updated_at' => $zone->updated_at,
                ]);
            } else {
                $classificationId = $classification->id;
            }

            // Update zone with classification_id
            DB::connection('zcs_db')
                ->table('zones')
                ->where('id', $zone->id)
                ->update(['zoning_classification_id' => $classificationId]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->table('zones', function (Blueprint $table) {
            // Restore columns
            $table->string('code', 20)->after('id');
            $table->string('name', 100)->after('code');
            $table->text('description')->nullable()->after('name');
            $table->text('allowed_uses')->nullable()->after('description');
            $table->string('color', 20)->nullable()->after('allowed_uses');

            // Migrate data back from classifications
            $this->restoreZoneDataFromClassifications();

            // Drop foreign key and classification_id
            $table->dropForeign(['zoning_classification_id']);
            $table->dropColumn(['zoning_classification_id', 'label']);

            // Restore unique constraint
            $table->unique('code');
        });
    }

    /**
     * Restore zone data from classifications.
     */
    private function restoreZoneDataFromClassifications(): void
    {
        $zones = DB::connection('zcs_db')
            ->table('zones')
            ->join('zoning_classifications', 'zones.zoning_classification_id', '=', 'zoning_classifications.id')
            ->select('zones.id', 'zoning_classifications.*')
            ->get();

        foreach ($zones as $zone) {
            DB::connection('zcs_db')
                ->table('zones')
                ->where('id', $zone->id)
                ->update([
                    'code' => $zone->code,
                    'name' => $zone->name,
                    'description' => $zone->description,
                    'allowed_uses' => $zone->allowed_uses,
                    'color' => $zone->color,
                ]);
        }
    }
};
