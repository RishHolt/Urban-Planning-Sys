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
        Schema::connection('ipc_db')->create('project_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('infrastructure_projects')->onDelete('cascade');
            $table->text('update_description');
            $table->decimal('progress_percentage', 5, 2)->nullable();
            $table->text('issues')->nullable();
            $table->text('next_steps')->nullable();
            $table->unsignedBigInteger('updated_by'); // References users table in user_db
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('project_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('ipc_db')->dropIfExists('project_updates');
    }
};
