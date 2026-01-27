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
        return 'zcs_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('zcs_db')->table('inspections', function (Blueprint $table) {
            $table->text('recommendations')->nullable()->after('findings');
            $table->enum('inspection_status', ['pending', 'completed', 'reviewed'])->default('pending')->after('result');
            $table->timestamp('completed_at')->nullable()->after('inspected_at');
            $table->timestamp('reviewed_at')->nullable()->after('completed_at');
            $table->unsignedBigInteger('reviewed_by')->nullable()->after('reviewed_at');
            $table->text('review_notes')->nullable()->after('reviewed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->table('inspections', function (Blueprint $table) {
            $table->dropColumn([
                'recommendations',
                'inspection_status',
                'completed_at',
                'reviewed_at',
                'reviewed_by',
                'review_notes',
            ]);
        });
    }
};
