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
        Schema::connection('sbr_db')->create('building_plan_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_review_id')->constrained('building_reviews')->onDelete('cascade');
            $table->enum('check_type', ['safety_sanitation', 'structural', 'deed_restrictions']);
            $table->unsignedBigInteger('reviewer_id'); // No FK constraint (cross-database)
            $table->text('findings')->nullable();
            $table->text('recommendations')->nullable();
            $table->enum('result', ['passed', 'failed', 'conditional']);
            $table->timestamp('reviewed_at')->nullable();

            // Indexes
            $table->index('building_review_id', 'idx_check_building');
            $table->index('check_type', 'idx_check_type');
            $table->index('result', 'idx_check_result');
            $table->index('reviewer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('sbr_db')->dropIfExists('building_plan_checks');
    }
};
