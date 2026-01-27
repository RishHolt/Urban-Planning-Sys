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
        Schema::connection('ipc_db')->create('project_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('infrastructure_projects')->onDelete('cascade');
            $table->foreignId('phase_id')->nullable()->constrained('project_phases')->onDelete('set null');
            $table->foreignId('milestone_id')->nullable()->constrained('phase_milestones')->onDelete('set null');
            $table->unsignedBigInteger('inspection_id')->nullable();
            $table->string('photo_path', 500);
            $table->string('photo_description', 255)->nullable();
            $table->enum('photo_category', [
                'progress',
                'milestone',
                'inspection',
                'before_after',
                'deficiency',
                'completion',
                'as_built',
                'other',
            ])->default('progress');
            $table->dateTime('taken_at')->nullable();
            $table->unsignedBigInteger('taken_by'); // References users table in user_db
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('project_id');
            $table->index('photo_category');
            $table->index('taken_at');
            $table->index('phase_id');
            $table->index('milestone_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('ipc_db')->dropIfExists('project_photos');
    }
};
