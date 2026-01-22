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
        return 'ipc_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('ipc_db')->create('contractors', function (Blueprint $table) {
            $table->id();
            $table->string('contractor_code', 30)->unique();
            $table->string('company_name', 150);
            $table->string('contact_person', 150)->nullable();
            $table->string('contact_number', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('address', 255)->nullable();
            $table->string('license_number', 50)->nullable();
            $table->enum('contractor_type', [
                'general_contractor',
                'subcontractor',
                'supplier',
                'consultant',
            ]);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes
            $table->index('contractor_code');
            $table->index('contractor_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('ipc_db')->dropIfExists('contractors');
    }
};
