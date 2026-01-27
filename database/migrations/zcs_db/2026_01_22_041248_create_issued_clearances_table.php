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
        Schema::connection('zcs_db')->create('issued_clearances', function (Blueprint $table) {
            $table->id();
            $table->string('clearance_no', 50)->unique();
            $table->unsignedBigInteger('application_id');
            $table->unsignedBigInteger('issued_by'); // No FK constraint (cross-database)
            $table->date('issue_date');
            $table->date('valid_until')->nullable();
            $table->text('conditions')->nullable();
            $table->enum('status', ['active', 'revoked', 'expired'])->default('active');
            $table->timestamps();

            $table->index('application_id');
            $table->index('clearance_no', 'idx_clearance_no');
            $table->index('status', 'idx_clearance_status');
            $table->index('valid_until', 'idx_clearance_validity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->dropIfExists('issued_clearances');
    }
};
