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
        Schema::create('COMPLAINTS', function (Blueprint $table) {
            $table->id();
            $table->string('complaint_no', 30)->unique();
            $table->foreignId('building_id')->constrained('BUILDINGS', 'id')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('BUILDING_UNITS', 'id')->onDelete('cascade');
            $table->string('complainant_name', 150);
            $table->string('complainant_contact', 50)->nullable();
            $table->enum('complaint_type', ['noise', 'sanitation', 'unauthorized_use', 'overcrowding', 'fire_hazard', 'structural', 'parking', 'other']);
            $table->text('description');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['open', 'assigned', 'investigated', 'resolved', 'closed'])->default('open');
            $table->unsignedBigInteger('assigned_to')->nullable(); // References users table in user_db
            $table->unsignedBigInteger('inspection_id')->nullable(); // Will add foreign key constraint after INSPECTIONS table is created
            $table->text('resolution')->nullable();
            $table->unsignedBigInteger('resolved_by')->nullable(); // References users table in user_db
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();

            // Indexes
            $table->index('complaint_no');
            $table->index('building_id');
            $table->index('unit_id');
            $table->index('status');
            $table->index('priority');
            $table->index('assigned_to');
            $table->index('inspection_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('COMPLAINTS');
    }
};
