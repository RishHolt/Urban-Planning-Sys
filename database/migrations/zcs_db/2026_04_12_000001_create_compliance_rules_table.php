<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'zcs_db';

    public function up(): void
    {
        Schema::connection($this->connection)->create('compliance_rules', function (Blueprint $table) {
            $table->id();
            $table->string('classification_code', 20)->unique();
            $table->string('name');
            $table->json('allowed_uses');
            $table->decimal('front_setback', 8, 2)->default(3.00);
            $table->decimal('rear_setback', 8, 2)->default(2.00);
            $table->decimal('side_setback', 8, 2)->default(1.50);
            $table->decimal('floor_area_ratio', 5, 2)->default(0.60);
            $table->decimal('max_height', 8, 2)->default(15.00);
            $table->unsignedSmallInteger('max_storeys')->default(5);
            $table->decimal('open_space_requirement', 5, 2)->default(0.20);
            $table->decimal('min_lot_area', 10, 2)->default(100.00);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->dropIfExists('compliance_rules');
    }
};
