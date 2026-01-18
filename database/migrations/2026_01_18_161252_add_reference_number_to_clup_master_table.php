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
        Schema::connection('zcs_db')->table('clup_master', function (Blueprint $table) {
            $table->string('reference_no', 50)->unique()->nullable()->after('clup_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->table('clup_master', function (Blueprint $table) {
            $table->dropColumn('reference_no');
        });
    }
};
