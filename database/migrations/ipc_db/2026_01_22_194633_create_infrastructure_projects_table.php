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
        Schema::connection('ipc_db')->create('infrastructure_projects', function (Blueprint $table) {
            $table->id();
            $table->string('project_code', 30)->unique();
            $table->string('sbr_reference_no', 30)->nullable();
            $table->string('project_name', 150);
            $table->text('project_description')->nullable();
            $table->enum('project_type', [
                'road_construction',
                'drainage_system',
                'water_supply',
                'sewerage',
                'electrical',
                'multi_utility',
            ]);
            $table->string('location', 255);
            $table->decimal('pin_lat', 10, 8)->nullable();
            $table->decimal('pin_lng', 11, 8)->nullable();
            $table->string('barangay', 100)->nullable();
            $table->decimal('budget', 15, 2)->default(0);
            $table->decimal('actual_cost', 15, 2)->default(0);
            $table->date('start_date')->nullable();
            $table->date('target_completion')->nullable();
            $table->date('actual_completion')->nullable();
            $table->enum('status', [
                'planning',
                'approved',
                'bidding',
                'contract_signed',
                'ongoing',
                'suspended',
                'delayed',
                'completed',
                'cancelled',
            ])->default('planning');
            $table->unsignedBigInteger('project_manager_id'); // References users table in user_db
            $table->text('scope_of_work')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes
            $table->index('project_code');
            $table->index('sbr_reference_no');
            $table->index('status');
            $table->index('project_manager_id');
            $table->index('project_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('ipc_db')->dropIfExists('infrastructure_projects');
    }
};
