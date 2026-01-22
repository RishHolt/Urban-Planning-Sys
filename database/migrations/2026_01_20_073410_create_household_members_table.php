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
        Schema::connection('hbr_db')->create('household_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained('households')->onDelete('cascade');
            $table->foreignId('housing_beneficiary_id')->constrained('housing_beneficiaries')->onDelete('cascade');

            // Relationship to household head
            $table->enum('relationship_to_head', [
                'head',
                'spouse',
                'child',
                'parent',
                'sibling',
                'other_relative',
                'non_relative',
            ])->default('head');

            // Membership status
            $table->enum('membership_status', ['active', 'inactive', 'removed'])->default('active');

            $table->timestamps();

            // Indexes
            $table->index('household_id');
            $table->index('housing_beneficiary_id');
            $table->unique(['household_id', 'housing_beneficiary_id'], 'household_beneficiary_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('household_members');
    }
};
