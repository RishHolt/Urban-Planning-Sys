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
        Schema::connection('zcs_db')->create('inspection_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inspection_id');
            $table->string('item_name');
            $table->text('description')->nullable();
            $table->enum('compliance_status', ['compliant', 'non_compliant', 'not_applicable', 'pending'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('inspection_id');
            $table->index('compliance_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->dropIfExists('inspection_checklist_items');
    }
};
