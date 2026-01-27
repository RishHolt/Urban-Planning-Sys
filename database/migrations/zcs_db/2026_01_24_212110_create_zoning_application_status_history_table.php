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
        Schema::connection('zcs_db')->create('zoning_application_status_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('zoning_application_id');
            $table->string('status_from')->nullable();
            $table->string('status_to');
            $table->string('changed_by', 36);
            $table->text('notes')->nullable();
            $table->timestamp('created_at');
            
            // Foreign key
            $table->foreign('zoning_application_id')
                ->references('id')
                ->on('zoning_applications')
                ->onDelete('cascade');
            
            // Indexes
            $table->index('zoning_application_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zoning_application_status_history');
    }
};
