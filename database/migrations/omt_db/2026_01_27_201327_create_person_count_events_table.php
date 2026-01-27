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
        Schema::connection('omt_db')->create('person_count_events', function (Blueprint $table) {
            $table->id();
            $table->integer('count'); // Current number of people
            $table->bigInteger('timestamp'); // Unix timestamp in seconds
            $table->string('device_id')->nullable();
            $table->timestamps();

            $table->index(['timestamp', 'device_id']);
            $table->index('device_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('omt_db')->dropIfExists('person_count_events');
    }
};
