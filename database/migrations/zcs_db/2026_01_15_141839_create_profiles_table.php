<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Get the migration connection name.
     * Uses 'zcs_db' connection for user database.
     */
    public function getConnection(): ?string
    {
        return 'zcs_db'; // Use user_db connection (user database)
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('zcs_db')->create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('email')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('suffix', 10)->nullable();
            $table->string('mobile_number', 20);
            $table->string('address');
            $table->string('street');
            $table->string('barangay');
            $table->string('city');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->dropIfExists('profiles');
    }
};
