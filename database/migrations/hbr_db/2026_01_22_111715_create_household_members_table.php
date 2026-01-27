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
        // Drop old table if it exists (from previous migration structure)
        Schema::connection('hbr_db')->dropIfExists('household_members');

        Schema::connection('hbr_db')->create('household_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('beneficiary_id')->constrained('beneficiaries')->onDelete('cascade');
            $table->string('full_name');
            $table->enum('relationship', [
                'head',
                'spouse',
                'child',
                'parent',
                'sibling',
                'other_relative',
                'non_relative',
            ]);
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->string('occupation')->nullable();
            $table->decimal('monthly_income', 12, 2)->nullable();
            $table->boolean('is_dependent')->default(false);
            $table->timestamps();

            $table->index('beneficiary_id');
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
