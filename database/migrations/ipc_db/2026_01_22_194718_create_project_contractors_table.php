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
        return 'ipc_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('ipc_db')->create('project_contractors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('infrastructure_projects')->onDelete('cascade');
            $table->foreignId('contractor_id')->constrained('contractors')->onDelete('cascade');
            $table->enum('role', [
                'prime_contractor',
                'subcontractor',
                'supplier',
                'consultant',
            ]);
            $table->decimal('contract_amount', 15, 2)->default(0);
            $table->date('contract_start_date')->nullable();
            $table->date('contract_end_date')->nullable();
            $table->enum('status', [
                'active',
                'completed',
                'terminated',
            ])->default('active');
            $table->text('remarks')->nullable();
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index(['project_id', 'contractor_id']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('ipc_db')->dropIfExists('project_contractors');
    }
};
