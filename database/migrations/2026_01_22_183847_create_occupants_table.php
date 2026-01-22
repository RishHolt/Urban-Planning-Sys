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
        Schema::connection('omt_db')->create('OCCUPANTS', function (Blueprint $table) {
            $table->id();
            $table->foreignId('occupancy_record_id')->constrained('OCCUPANCY_RECORDS', 'id')->onDelete('cascade');
            $table->string('full_name', 150);
            $table->string('contact_number', 50)->nullable();
            $table->string('email')->nullable();
            $table->enum('relationship_to_owner', ['owner', 'tenant', 'family_member', 'authorized_occupant']);
            $table->date('move_in_date');
            $table->date('move_out_date')->nullable();
            $table->boolean('is_primary_occupant')->default(false);
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('occupancy_record_id');
            $table->index('is_primary_occupant');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('omt_db')->dropIfExists('OCCUPANTS');
    }
};
