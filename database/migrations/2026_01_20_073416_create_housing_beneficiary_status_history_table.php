<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Get the migration connection name.
     * Uses 'hbr_db' connection for HBR database.
     */
    public function getConnection(): ?string
    {
        return 'hbr_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('hbr_db')->create('housing_beneficiary_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('housing_beneficiary_application_id')
                ->constrained('housing_beneficiary_applications')
                ->onDelete('cascade')
                ->name('hbr_status_history_app_id_foreign');
            $table->enum('status_from', ['draft', 'submitted', 'under_review', 'approved', 'rejected'])->nullable();
            $table->enum('status_to', ['draft', 'submitted', 'under_review', 'approved', 'rejected']);
            $table->unsignedBigInteger('changed_by'); // No FK constraint (cross-database)
            $table->text('notes')->nullable();
            $table->timestamp('created_at');

            // Indexes
            $table->index('housing_beneficiary_application_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('housing_beneficiary_status_history');
    }
};
