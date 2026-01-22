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
        Schema::connection('hbr_db')->create('housing_beneficiary_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('housing_beneficiary_application_id')->constrained('housing_beneficiary_applications')->onDelete('cascade');
            $table->string('document_type'); // proof_of_identity, proof_of_income, proof_of_residence, special_eligibility_certificate, requested_documents
            $table->enum('type', ['upload', 'manual'])->nullable(); // Type for documents with upload/manual options
            $table->string('manual_id')->nullable(); // Manual ID for documents with manual option
            $table->string('file_path')->nullable(); // Nullable for manual type documents
            $table->string('file_name')->nullable(); // Nullable for manual type documents
            $table->unsignedBigInteger('file_size')->nullable(); // Nullable for manual type documents
            $table->string('mime_type')->nullable(); // Nullable for manual type documents

            // Status and review fields
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('notes')->nullable();

            // Version control fields
            $table->unsignedInteger('version')->default(1);
            $table->unsignedBigInteger('parent_document_id')->nullable();
            $table->boolean('is_current')->default(true);
            $table->unsignedBigInteger('replaced_by')->nullable();
            $table->timestamp('replaced_at')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('housing_beneficiary_application_id');
            $table->index('document_type');
            $table->index('status');
            $table->index(['housing_beneficiary_application_id', 'document_type', 'is_current'], 'hbr_docs_app_type_current_idx');
            $table->index('parent_document_id', 'hbr_docs_parent_idx');

            // Foreign key for parent document
            $table->foreign('parent_document_id')
                ->references('id')
                ->on('housing_beneficiary_documents')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('housing_beneficiary_documents');
    }
};
