<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('zcs_db')->table('zoning_applications', function (Blueprint $table) {
            $table->string('owner_name')->nullable()->change();
            $table->text('owner_address')->nullable()->change();
            $table->string('owner_contact')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->table('zoning_applications', function (Blueprint $table) {
            $table->string('owner_name')->nullable(false)->change();
            $table->text('owner_address')->nullable(false)->change();
            $table->string('owner_contact')->nullable(false)->change();
        });
    }
};
