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
        return 'omt_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('omt_db')->create('INSPECTION_PHOTOS', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_id')->constrained('INSPECTIONS', 'id')->onDelete('cascade');
            $table->string('photo_path', 500);
            $table->string('photo_description', 255)->nullable();
            $table->timestamp('taken_at')->useCurrent();
            $table->unsignedBigInteger('taken_by'); // References users table in user_db
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('inspection_id');
            $table->index('taken_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('omt_db')->dropIfExists('INSPECTION_PHOTOS');
    }
};
