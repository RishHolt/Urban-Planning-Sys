<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('zcs_db')->create('zoning_application_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('zoning_application_id');
            $table->string('document_type'); // authorization_letter, proof_of_ownership, tax_declaration, etc.
            $table->string('type')->nullable(); // specific type within document_type
            $table->string('manual_id')->nullable(); // for tax_declaration_id, barangay_clearance_id, etc.
            $table->string('file_path');
            $table->string('file_name');
            $table->bigInteger('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->string('reviewed_by', 36)->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('notes')->nullable();
            
            // Version control
            $table->integer('version')->default(1);
            $table->unsignedBigInteger('parent_document_id')->nullable();
            $table->boolean('is_current')->default(true);
            $table->unsignedBigInteger('replaced_by')->nullable();
            $table->timestamp('replaced_at')->nullable();
            
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('zoning_application_id')
                ->references('id')
                ->on('zoning_applications')
                ->onDelete('cascade');
            $table->foreign('parent_document_id')
                ->references('id')
                ->on('zoning_application_documents')
                ->onDelete('set null');
            $table->foreign('replaced_by')
                ->references('id')
                ->on('zoning_application_documents')
                ->onDelete('set null');
            
            // Indexes
            $table->index('zoning_application_id');
            $table->index('document_type');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zoning_application_documents');
    }
};
