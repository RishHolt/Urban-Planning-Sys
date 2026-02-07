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
        return 'hbr_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('hbr_db')->create('awards', function (Blueprint $table) {
            $table->id();
            $table->string('award_no')->unique();
            $table->foreignId('beneficiary_id')->constrained('beneficiaries')->onDelete('cascade');
            $table->foreignId('application_id')->constrained('beneficiary_applications')->onDelete('cascade');
            $table->foreignId('allocation_id')->nullable()->constrained('allocations')->onDelete('set null');
            $table->foreignId('project_id')->constrained('housing_projects')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('housing_units')->onDelete('set null');

            // Award details
            $table->enum('award_status', [
                'generated',
                'pending_approval',
                'approved',
                'rejected',
                'accepted',
                'declined',
                'cancelled',
            ])->default('generated');

            // Award dates
            $table->date('award_date');
            $table->date('acceptance_deadline');
            $table->date('accepted_date')->nullable();
            $table->date('declined_date')->nullable();
            $table->date('turnover_date')->nullable();

            // Approval workflow
            $table->unsignedBigInteger('generated_by')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('approval_remarks')->nullable();
            $table->text('rejection_reason')->nullable();

            // Acceptance/decline
            $table->text('acceptance_remarks')->nullable();
            $table->text('decline_reason')->nullable();

            // Notification tracking
            $table->boolean('notification_sent')->default(false);
            $table->timestamp('notification_sent_at')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('award_no');
            $table->index('beneficiary_id');
            $table->index('application_id');
            $table->index('award_status');
            $table->index('award_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('awards');
    }
};
