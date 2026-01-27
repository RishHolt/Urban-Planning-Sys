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
        Schema::connection('omt_db')->create('OCCUPANCY_HISTORY', function (Blueprint $table) {
            $table->id();
            $table->foreignId('occupancy_record_id')->constrained('OCCUPANCY_RECORDS', 'id')->onDelete('cascade');
            $table->enum('status', ['active', 'inactive', 'terminated', 'transferred']);
            $table->text('remarks')->nullable();
            $table->unsignedBigInteger('updated_by'); // References users table in user_db
            $table->timestamp('updated_at')->useCurrent();

            // Indexes
            $table->index('occupancy_record_id');
            $table->index('status');
            $table->index('updated_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('omt_db')->dropIfExists('OCCUPANCY_HISTORY');
    }
};
