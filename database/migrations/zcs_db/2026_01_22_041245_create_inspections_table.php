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
        Schema::connection('zcs_db')->create('inspections', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('application_id');
            $table->unsignedBigInteger('inspector_id'); // No FK constraint (cross-database)
            $table->date('scheduled_date');
            $table->text('findings')->nullable();
            $table->enum('result', ['pending', 'passed', 'failed'])->default('pending');
            $table->timestamp('inspected_at')->nullable();

            $table->index('application_id');
            $table->index('inspector_id');
            $table->index('scheduled_date');
            $table->index('result');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->dropIfExists('inspections');
    }
};
