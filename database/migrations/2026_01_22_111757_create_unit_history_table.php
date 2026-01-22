<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Get the migration connection name.
     * Uses 'hbr_db' connection for HBR database.
     */
    public function getConnection(): ?string
    {
        return 'hbr_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('hbr_db')->create('unit_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained('housing_units')->onDelete('cascade');

            // History Details
            $table->enum('status', ['available', 'reserved', 'allocated', 'occupied', 'maintenance']);
            $table->unsignedBigInteger('beneficiary_id')->nullable(); // No FK constraint (cross-database reference)
            $table->text('remarks')->nullable();
            $table->timestamp('recorded_at')->useCurrent();

            // Indexes
            $table->index('unit_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('unit_history');
    }
};
