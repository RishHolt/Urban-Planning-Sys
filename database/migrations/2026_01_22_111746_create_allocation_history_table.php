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
        Schema::connection('hbr_db')->create('allocation_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('allocation_id')->constrained('allocations')->onDelete('cascade');

            // History Details
            $table->enum('status', [
                'proposed',
                'committee_review',
                'approved',
                'rejected',
                'accepted',
                'declined',
                'cancelled',
                'moved_in',
            ]);
            $table->text('remarks')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable(); // No FK constraint (cross-database)
            $table->timestamp('updated_at')->useCurrent();

            // Indexes
            $table->index('allocation_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('allocation_history');
    }
};
