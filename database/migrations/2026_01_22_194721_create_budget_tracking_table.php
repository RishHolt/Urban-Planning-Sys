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
        Schema::connection('ipc_db')->create('budget_tracking', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('infrastructure_projects')->onDelete('cascade');
            $table->foreignId('phase_id')->nullable()->constrained('project_phases')->onDelete('set null');
            $table->enum('budget_category', [
                'labor',
                'materials',
                'equipment',
                'consultancy',
                'contingency',
                'other',
            ]);
            $table->decimal('allocated_amount', 15, 2)->default(0);
            $table->decimal('spent_amount', 15, 2)->default(0);
            $table->decimal('remaining_amount', 15, 2)->default(0);
            $table->text('description')->nullable();
            $table->integer('year')->nullable();
            $table->integer('quarter')->nullable();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            // Indexes
            $table->index('project_id');
            $table->index(['year', 'quarter']);
            $table->index('budget_category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('ipc_db')->dropIfExists('budget_tracking');
    }
};
