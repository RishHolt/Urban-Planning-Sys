<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Check if a column exists in the table.
     */
    private function columnExists(string $table, string $column): bool
    {
        $connection = DB::connection('zcs_db');
        $database = $connection->getDatabaseName();
        $result = $connection->select(
            'SELECT COUNT(*) as count 
             FROM information_schema.COLUMNS 
             WHERE TABLE_SCHEMA = ? 
             AND TABLE_NAME = ? 
             AND COLUMN_NAME = ?',
            [$database, $table, $column]
        );

        return $result[0]->count > 0;
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $table = 'zoning_application_documents';

        // Change document_type from enum to string if it's still an enum
        if ($this->columnExists($table, 'document_type')) {
            try {
                DB::connection('zcs_db')->statement('ALTER TABLE zoning_application_documents MODIFY document_type VARCHAR(255)');
            } catch (\Exception $e) {
                // Column might already be a string, ignore error
            }
        }

        // Add type field if it doesn't exist
        if (! $this->columnExists($table, 'type')) {
            Schema::connection('zcs_db')->table($table, function (Blueprint $table) {
                $table->enum('type', ['upload', 'manual'])->nullable()->after('document_type');
            });
        }

        // Add manual_id field if it doesn't exist
        if (! $this->columnExists($table, 'manual_id')) {
            Schema::connection('zcs_db')->table($table, function (Blueprint $table) {
                $table->string('manual_id')->nullable()->after('type');
            });
        }

        // Make file fields nullable if they aren't already (for manual type documents)
        if ($this->columnExists($table, 'file_path')) {
            try {
                DB::connection('zcs_db')->statement('ALTER TABLE zoning_application_documents MODIFY file_path VARCHAR(255) NULL');
                DB::connection('zcs_db')->statement('ALTER TABLE zoning_application_documents MODIFY file_name VARCHAR(255) NULL');
                DB::connection('zcs_db')->statement('ALTER TABLE zoning_application_documents MODIFY file_size BIGINT UNSIGNED NULL');
                DB::connection('zcs_db')->statement('ALTER TABLE zoning_application_documents MODIFY mime_type VARCHAR(255) NULL');
            } catch (\Exception $e) {
                // Fields might already be nullable, ignore error
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->table('zoning_application_documents', function (Blueprint $table) {
            $table->dropColumn(['type', 'manual_id']);
            // Note: Changing back to enum would require data migration, so we'll leave it as string
        });
    }
};
