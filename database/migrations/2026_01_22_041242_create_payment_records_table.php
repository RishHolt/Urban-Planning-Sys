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
        Schema::connection('zcs_db')->create('payment_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('application_id');
            $table->string('or_number', 50)->unique();
            $table->decimal('amount', 10, 2);
            $table->date('payment_date');
            $table->string('treasury_ref', 100)->nullable();
            $table->unsignedBigInteger('recorded_by'); // No FK constraint (cross-database)
            $table->timestamp('created_at');

            $table->index('application_id');
            $table->index('or_number');
            $table->index('payment_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->dropIfExists('payment_records');
    }
};
