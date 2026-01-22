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
        Schema::connection('zcs_db')->create('zones', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->text('allowed_uses')->nullable();
            $table->json('geometry')->nullable(); // GeoJSON geometry
            $table->string('color', 20)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('code');
            $table->index('is_active');
        });

        // Migrate data from existing tables if they exist
        if (Schema::connection('zcs_db')->hasTable('zoning_classification') &&
            Schema::connection('zcs_db')->hasTable('zoning_gis_polygon')) {
            $this->migrateZoneData();
        }
    }

    /**
     * Migrate data from old zone tables to new zones table.
     */
    private function migrateZoneData(): void
    {
        $classifications = DB::connection('zcs_db')
            ->table('zoning_classification')
            ->get();

        foreach ($classifications as $classification) {
            // Get associated polygon geometry
            $polygon = DB::connection('zcs_db')
                ->table('zoning_gis_polygon')
                ->where('zoning_id', $classification->zoning_id)
                ->first();

            $geometry = $polygon ? json_decode($polygon->geometry, true) : null;

            DB::connection('zcs_db')->table('zones')->insert([
                'code' => $classification->zoning_code,
                'name' => $classification->zone_name,
                'description' => null,
                'allowed_uses' => $classification->allowed_uses,
                'geometry' => $geometry ? json_encode($geometry) : null,
                'color' => null,
                'is_active' => true,
                'created_at' => $classification->created_at ?? now(),
                'updated_at' => $classification->updated_at ?? now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->dropIfExists('zones');
    }
};
