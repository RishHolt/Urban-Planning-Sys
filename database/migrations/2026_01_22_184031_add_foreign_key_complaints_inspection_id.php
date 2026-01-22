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
        return 'omt_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('omt_db')->table('COMPLAINTS', function (Blueprint $table) {
            $table->foreign('inspection_id')
                ->references('id')
                ->on('INSPECTIONS')
                ->onDelete('set null');
        });

        Schema::connection('omt_db')->table('INSPECTIONS', function (Blueprint $table) {
            $table->foreign('complaint_id')
                ->references('id')
                ->on('COMPLAINTS')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('omt_db')->table('COMPLAINTS', function (Blueprint $table) {
            $table->dropForeign(['inspection_id']);
        });

        Schema::connection('omt_db')->table('INSPECTIONS', function (Blueprint $table) {
            $table->dropForeign(['complaint_id']);
        });
    }
};
