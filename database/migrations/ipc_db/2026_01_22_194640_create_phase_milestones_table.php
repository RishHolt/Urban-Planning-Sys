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
        return 'ipc_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('ipc_db')->create('phase_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('phase_id')->constrained('project_phases')->onDelete('cascade');
            $table->string('milestone_name', 150);
            $table->text('description')->nullable();
            $table->date('target_date')->nullable();
            $table->date('actual_date')->nullable();
            $table->enum('status', [
                'pending',
                'achieved',
                'missed',
                'rescheduled',
            ])->default('pending');
            $table->text('remarks')->nullable();
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('phase_id');
            $table->index('status');
            $table->index('target_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('ipc_db')->dropIfExists('phase_milestones');
    }
};
