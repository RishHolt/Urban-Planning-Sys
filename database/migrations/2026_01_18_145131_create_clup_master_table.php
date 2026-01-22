<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    /**
     * Get the migration connection name.
     */
    public function getConnection(): ?string
    {
        return 'zcs_db';
    }

    public function up(): void
    {
        Schema::connection('zcs_db')->create('clup_master', function (Blueprint $table) {
            $table->id('clup_id');
            $table->string('reference_no', 50)->unique()->nullable();
            $table->string('lgu_name', 150);
            $table->integer('coverage_start_year');
            $table->integer('coverage_end_year');
            $table->date('approval_date')->nullable();
            $table->string('approving_body', 150)->nullable();
            $table->string('resolution_no', 100)->nullable();
            $table->enum('status', ['Active', 'Archived'])->default('Active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clup_master');
    }
};
