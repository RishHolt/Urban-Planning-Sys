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
        Schema::connection('zcs_db')->create('zoning_classification', function (Blueprint $table) {
            $table->id('zoning_id');
            $table->unsignedBigInteger('clup_id');
            $table->string('zoning_code', 10);
            $table->string('zone_name', 100);
            $table->string('land_use_category', 50)->nullable();
            $table->text('allowed_uses')->nullable();
            $table->text('conditional_uses')->nullable();
            $table->text('prohibited_uses')->nullable();
            $table->timestamps();

            $table->foreign('clup_id')->references('clup_id')->on('clup_master')->onDelete('cascade');
            $table->index('clup_id');
            $table->unique(['clup_id', 'zoning_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zoning_classification');
    }
};
