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
        Schema::connection('ipc_db')->create('project_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('infrastructure_projects')->onDelete('cascade');
            $table->foreignId('phase_id')->nullable()->constrained('project_phases')->onDelete('set null');
            $table->enum('inspection_type', [
                'pre_construction',
                'material_inspection',
                'progress_inspection',
                'milestone_inspection',
                'final_inspection',
                'follow_up',
            ]);
            $table->unsignedBigInteger('inspector_id'); // References users table in user_db
            $table->date('scheduled_date')->nullable();
            $table->date('inspection_date')->nullable();
            $table->text('findings')->nullable();
            $table->text('deficiencies')->nullable();
            $table->enum('result', [
                'passed',
                'failed',
                'conditional',
            ])->nullable();
            $table->text('recommendations')->nullable();
            $table->date('next_inspection_date')->nullable();
            $table->dateTime('inspected_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('project_id');
            $table->index('scheduled_date');
            $table->index('result');
            $table->index('phase_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('ipc_db')->dropIfExists('project_inspections');
    }
};
