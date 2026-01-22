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
        Schema::connection('omt_db')->create('COMPLIANCE_REPORTS', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->nullable()->constrained('BUILDINGS', 'id')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('BUILDING_UNITS', 'id')->onDelete('cascade');
            $table->unsignedInteger('year');
            $table->unsignedInteger('quarter')->nullable(); // 1-4 for quarterly reports
            $table->enum('compliance_status', ['compliant', 'non_compliant', 'conditional', 'pending_review'])->default('pending_review');
            $table->unsignedInteger('violations_count')->default(0);
            $table->unsignedInteger('inspections_count')->default(0);
            $table->text('summary')->nullable();
            $table->timestamp('generated_at')->useCurrent();
            $table->unsignedBigInteger('generated_by'); // References users table in user_db

            // Indexes
            $table->index('building_id');
            $table->index('unit_id');
            $table->index(['year', 'quarter']);
            $table->index('compliance_status');
            $table->index('generated_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('omt_db')->dropIfExists('COMPLIANCE_REPORTS');
    }
};
