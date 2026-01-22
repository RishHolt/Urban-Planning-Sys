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
        Schema::connection('hbr_db')->create('project_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('housing_projects')->onDelete('cascade');

            // Document Information
            $table->enum('document_type', [
                'project_plan',
                'zoning_clearance',
                'building_permit',
                'environmental_clearance',
                'title_deed',
                'contract',
                'other',
            ]);
            $table->string('file_name');
            $table->string('file_path');
            $table->timestamp('uploaded_at')->useCurrent();

            $table->timestamps();

            // Indexes
            $table->index('project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('project_documents');
    }
};
