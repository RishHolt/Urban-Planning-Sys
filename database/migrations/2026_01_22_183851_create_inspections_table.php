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
        Schema::connection('omt_db')->create('INSPECTIONS', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained('BUILDINGS', 'id')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('BUILDING_UNITS', 'id')->onDelete('cascade');
            $table->enum('inspection_type', ['annual', 'periodic', 'pre_occupancy', 'complaint_based', 'follow_up', 'random']);
            $table->unsignedBigInteger('inspector_id'); // References users table in user_db
            $table->unsignedBigInteger('complaint_id')->nullable(); // Will add foreign key constraint after COMPLAINTS table is created
            $table->date('scheduled_date');
            $table->date('inspection_date')->nullable();
            $table->text('findings')->nullable();
            $table->text('compliance_notes')->nullable();
            $table->enum('result', ['compliant', 'non_compliant', 'conditional', 'pending_correction'])->nullable();
            $table->text('recommendations')->nullable();
            $table->date('next_inspection_date')->nullable();
            $table->timestamp('inspected_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('building_id');
            $table->index('unit_id');
            $table->index('scheduled_date');
            $table->index('result');
            $table->index('inspection_type');
            $table->index('inspector_id');
            $table->index('complaint_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('omt_db')->dropIfExists('INSPECTIONS');
    }
};
