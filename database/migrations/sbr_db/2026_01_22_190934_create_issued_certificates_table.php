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
        Schema::connection('sbr_db')->create('issued_certificates', function (Blueprint $table) {
            $table->id();
            $table->string('certificate_no', 30)->unique();
            $table->foreignId('application_id')->constrained('subdivision_applications')->onDelete('cascade');
            $table->unsignedBigInteger('issued_by'); // No FK constraint (cross-database)
            $table->date('issue_date');
            $table->date('valid_until')->nullable();
            $table->text('conditions')->nullable();
            $table->string('final_plat_reference', 50)->nullable();
            $table->enum('status', ['active', 'revoked', 'expired'])->default('active');
            $table->timestamps();

            // Indexes
            $table->index('certificate_no', 'idx_certificate_no');
            $table->index('application_id', 'idx_certificate_application');
            $table->index('status', 'idx_certificate_status');
            $table->index('issued_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('sbr_db')->dropIfExists('issued_certificates');
    }
};
