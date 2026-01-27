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
        Schema::connection('ipc_db')->create('project_phases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('infrastructure_projects')->onDelete('cascade');
            $table->string('phase_name', 100);
            $table->enum('phase_type', [
                'planning',
                'procurement',
                'construction',
                'inspection',
                'turnover',
            ]);
            $table->integer('sequence_order')->default(1);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->date('actual_start_date')->nullable();
            $table->date('actual_end_date')->nullable();
            $table->decimal('budget', 15, 2)->default(0);
            $table->decimal('actual_cost', 15, 2)->default(0);
            $table->decimal('progress_percentage', 5, 2)->default(0);
            $table->enum('status', [
                'pending',
                'in_progress',
                'completed',
                'delayed',
                'cancelled',
            ])->default('pending');
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            // Indexes
            $table->index('project_id');
            $table->index('status');
            $table->index('phase_type');
            $table->index('sequence_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('ipc_db')->dropIfExists('project_phases');
    }
};
