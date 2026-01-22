<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Get the migration connection name.
     * Uses 'user_db' connection for user database.
     */
    public function getConnection(): ?string
    {
        return 'user_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('user_db')->table('profiles', function (Blueprint $table) {
            $table->dropColumn('birthday');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('user_db')->table('profiles', function (Blueprint $table) {
            $table->date('birthday')->after('suffix');
        });
    }
};
