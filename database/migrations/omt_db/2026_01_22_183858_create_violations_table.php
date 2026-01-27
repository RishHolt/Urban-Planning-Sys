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
        Schema::connection('omt_db')->create('VIOLATIONS', function (Blueprint $table) {
            $table->id();
            $table->string('violation_no', 30)->unique();
            $table->foreignId('building_id')->constrained('BUILDINGS', 'id')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('BUILDING_UNITS', 'id')->onDelete('cascade');
            $table->foreignId('inspection_id')->nullable()->constrained('INSPECTIONS', 'id')->onDelete('set null');
            $table->enum('violation_type', ['unauthorized_use', 'overcrowding', 'structural_modification', 'fire_safety', 'sanitation', 'noise', 'parking', 'maintenance', 'documentation', 'other']);
            $table->text('description');
            $table->enum('severity', ['minor', 'major', 'critical'])->default('minor');
            $table->enum('status', ['open', 'under_review', 'resolved', 'appealed', 'closed'])->default('open');
            $table->date('violation_date');
            $table->date('compliance_deadline')->nullable();
            $table->date('resolved_date')->nullable();
            $table->text('resolution')->nullable();
            $table->decimal('fine_amount', 10, 2)->nullable();
            $table->unsignedBigInteger('issued_by'); // References users table in user_db
            $table->unsignedBigInteger('resolved_by')->nullable(); // References users table in user_db
            $table->timestamps();

            // Indexes
            $table->index('violation_no');
            $table->index('building_id');
            $table->index('unit_id');
            $table->index('status');
            $table->index('compliance_deadline');
            $table->index('inspection_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('omt_db')->dropIfExists('VIOLATIONS');
    }
};
