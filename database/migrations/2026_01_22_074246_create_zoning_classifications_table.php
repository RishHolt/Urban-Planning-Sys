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
        Schema::connection('zcs_db')->create('zoning_classifications', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique(); // R1, R2, C1, etc.
            $table->string('name', 100); // Residential 1, Commercial 1, etc.
            $table->text('description')->nullable();
            $table->text('allowed_uses')->nullable();
            $table->string('color', 20)->nullable(); // Default color for this classification
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('code');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->dropIfExists('zoning_classifications');
    }
};
