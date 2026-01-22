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
        Schema::connection('zcs_db')->create('application_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('application_id');
            $table->enum('status', ['pending', 'under_review', 'for_inspection', 'approved', 'denied']);
            $table->text('remarks')->nullable();
            $table->unsignedBigInteger('updated_by'); // No FK constraint (cross-database)
            $table->timestamp('updated_at');

            $table->index('application_id');
            $table->index('status');
            $table->index('updated_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->dropIfExists('application_history');
    }
};
