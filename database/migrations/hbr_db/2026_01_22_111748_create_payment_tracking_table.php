<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Get the migration connection name.
     * Uses 'hbr_db' connection for HBR database.
     */
    public function getConnection(): ?string
    {
        return 'hbr_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('hbr_db')->create('payment_tracking', function (Blueprint $table) {
            $table->id();
            $table->foreignId('allocation_id')->constrained('allocations')->onDelete('cascade');

            // Treasury Reference
            $table->string('treasury_reference')->nullable();

            // Payment Period
            $table->unsignedInteger('payment_month');
            $table->unsignedInteger('payment_year');

            // Payment Details
            $table->decimal('amount_due', 12, 2);
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->date('due_date');
            $table->date('payment_date')->nullable();

            // Payment Status
            $table->enum('payment_status', ['pending', 'paid', 'overdue', 'waived'])->default('pending');
            $table->string('or_number')->nullable(); // Official Receipt Number

            // Sync Tracking
            $table->timestamp('synced_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('allocation_id');
            $table->index('payment_status');
            $table->index(['payment_year', 'payment_month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('payment_tracking');
    }
};
