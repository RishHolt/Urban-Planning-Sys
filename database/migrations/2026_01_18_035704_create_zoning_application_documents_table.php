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
            $table->foreignId('zoning_application_id')->constrained('zoning_applications')->onDelete('cascade');
            $table->string('document_type'); // String to support all document types
            $table->enum('type', ['upload', 'manual'])->nullable(); // Type for documents with upload/manual options
            $table->string('manual_id')->nullable(); // Manual ID for documents with manual option
            $table->string('file_path')->nullable(); // Nullable for manual type documents
            $table->string('file_name')->nullable(); // Nullable for manual type documents
            $table->unsignedBigInteger('file_size')->nullable(); // Nullable for manual type documents
            $table->string('mime_type')->nullable(); // Nullable for manual type documents
            $table->timestamps();

            // Indexes
            $table->index('zoning_application_id');
            $table->index('document_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->dropIfExists('zoning_application_documents');
    }
};
