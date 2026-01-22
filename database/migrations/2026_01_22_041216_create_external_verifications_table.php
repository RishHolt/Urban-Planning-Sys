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
        Schema::connection('zcs_db')->create('external_verifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('application_id');
            $table->enum('verification_type', ['tax_declaration', 'barangay_permit']);
            $table->string('reference_no', 50);
            $table->enum('status', ['pending', 'verified', 'failed', 'expired'])->default('pending');
            $table->text('response_data')->nullable();
            $table->string('external_system', 50);
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->index('application_id');
            $table->index('verification_type');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->dropIfExists('external_verifications');
    }
};
