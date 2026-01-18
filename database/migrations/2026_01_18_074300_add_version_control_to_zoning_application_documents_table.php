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
        $schema = Schema::connection('zcs_db');
        
        if (!$schema->hasColumn('zoning_application_documents', 'version')) {
            $schema->table('zoning_application_documents', function (Blueprint $table) {
                $table->unsignedInteger('version')->default(1)->after('notes');
            });
        }
        
        if (!$schema->hasColumn('zoning_application_documents', 'parent_document_id')) {
            $schema->table('zoning_application_documents', function (Blueprint $table) {
                $table->unsignedBigInteger('parent_document_id')->nullable()->after('version');
            });
        }
        
        if (!$schema->hasColumn('zoning_application_documents', 'is_current')) {
            $schema->table('zoning_application_documents', function (Blueprint $table) {
                $table->boolean('is_current')->default(true)->after('parent_document_id');
            });
        }
        
        if (!$schema->hasColumn('zoning_application_documents', 'replaced_by')) {
            $schema->table('zoning_application_documents', function (Blueprint $table) {
                $table->unsignedBigInteger('replaced_by')->nullable()->after('is_current');
            });
        }
        
        if (!$schema->hasColumn('zoning_application_documents', 'replaced_at')) {
            $schema->table('zoning_application_documents', function (Blueprint $table) {
                $table->timestamp('replaced_at')->nullable()->after('replaced_by');
            });
        }

        // Add indexes
        try {
            $schema->table('zoning_application_documents', function (Blueprint $table) {
                $table->index(['zoning_application_id', 'document_type', 'is_current'], 'zoning_docs_app_type_current_idx');
            });
        } catch (\Exception $e) {
            // Index might already exist
        }
        
        try {
            $schema->table('zoning_application_documents', function (Blueprint $table) {
                $table->index('parent_document_id', 'zoning_docs_parent_idx');
            });
        } catch (\Exception $e) {
            // Index might already exist
        }

        // Add foreign key constraint
        try {
            $schema->table('zoning_application_documents', function (Blueprint $table) {
                $table->foreign('parent_document_id')
                    ->references('id')
                    ->on('zoning_application_documents')
                    ->onDelete('set null');
            });
        } catch (\Exception $e) {
            // Foreign key might already exist
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->table('zoning_application_documents', function (Blueprint $table) {
            $table->dropIndex('zoning_docs_app_type_current_idx');
            $table->dropIndex('zoning_docs_parent_idx');
            $table->dropForeign(['parent_document_id']);
            $table->dropColumn(['version', 'parent_document_id', 'is_current', 'replaced_by', 'replaced_at']);
        });
    }
};
