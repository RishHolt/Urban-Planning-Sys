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
        Schema::connection('omt_db')->create('entry_exit_events', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // 'entry' or 'exit'
            $table->integer('person_id');
            $table->bigInteger('timestamp');
            $table->string('device_id')->nullable();
            $table->timestamps();

            $table->index(['type', 'timestamp']);
            $table->index('device_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('omt_db')->dropIfExists('entry_exit_events');
    }
};
