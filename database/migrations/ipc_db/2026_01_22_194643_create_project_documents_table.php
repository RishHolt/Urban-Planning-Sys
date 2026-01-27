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
        Schema::connection('ipc_db')->create('project_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('infrastructure_projects')->onDelete('cascade');
            $table->enum('document_type', [
                'project_plan',
                'engineering_design',
                'budget_allocation',
                'contract',
                'progress_report',
                'inspection_report',
                'completion_report',
                'as_built_drawings',
            ]);
            $table->string('file_name', 255);
            $table->string('file_path', 500);
            $table->string('file_type', 50)->nullable();
            $table->unsignedBigInteger('file_size')->default(0);
            $table->timestamp('uploaded_at')->useCurrent();

            // Indexes
            $table->index('project_id');
            $table->index('document_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('ipc_db')->dropIfExists('project_documents');
    }
};
