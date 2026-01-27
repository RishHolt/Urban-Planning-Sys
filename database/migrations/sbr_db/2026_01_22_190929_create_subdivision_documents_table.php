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
        return 'sbr_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('sbr_db')->create('subdivision_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('subdivision_applications')->onDelete('cascade');
            $table->enum('document_type', [
                'concept_plan',
                'vicinity_map',
                'preliminary_plat',
                'site_analysis',
                'environmental_assessment',
                'engineering_water',
                'engineering_sewer',
                'engineering_drainage',
                'engineering_streets',
                'final_plat',
                'compliance_docs',
            ]);
            $table->enum('stage', ['concept', 'preliminary', 'improvement', 'final']);
            $table->string('file_name', 255);
            $table->string('file_path', 500);
            $table->string('file_type', 50)->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->timestamp('uploaded_at')->useCurrent();

            // Indexes
            $table->index('application_id');
            $table->index('document_type');
            $table->index('stage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('sbr_db')->dropIfExists('subdivision_documents');
    }
};
