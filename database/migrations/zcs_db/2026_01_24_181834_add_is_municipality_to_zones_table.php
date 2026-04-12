<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function getConnection(): ?string
    {
        return 'zcs_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('zcs_db')->table('zones', function (Blueprint $table) {
            $table->boolean('is_municipality')->default(false)->after('is_active');
            $table->index('is_municipality');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->table('zones', function (Blueprint $table) {
            $table->dropIndex(['is_municipality']);
            $table->dropColumn('is_municipality');
        });
    }
};
