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
        Schema::connection('hbr_db')->create('beneficiary_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('beneficiary_id')->constrained('beneficiaries')->onDelete('cascade');
            $table->foreignId('application_id')->nullable()->constrained('beneficiary_applications')->onDelete('cascade');

            // Document Information
            $table->enum('document_type', [
                'valid_id',
                'birth_certificate',
                'marriage_certificate',
                'income_proof',
                'barangay_certificate',
                'tax_declaration',
                'dswd_certification',
                'pwd_id',
                'senior_citizen_id',
                'solo_parent_id',
                'disaster_certificate',
            ]);
            $table->string('file_name');
            $table->string('file_path');

            // Verification
            $table->enum('verification_status', ['pending', 'verified', 'invalid'])->default('pending');
            $table->unsignedBigInteger('verified_by')->nullable(); // No FK constraint (cross-database)
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('uploaded_at')->useCurrent();

            $table->timestamps();

            // Indexes
            $table->index('beneficiary_id');
            $table->index('application_id');
            $table->index('verification_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('beneficiary_documents');
    }
};
