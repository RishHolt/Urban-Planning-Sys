<?php

namespace Database\Seeders;

use App\Models\ZoningApplication;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ZoningApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ZoningApplication::factory()->count(5)->create();
    }
}
