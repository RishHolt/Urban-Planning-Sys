<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ZoningClassificationSeeder::class,
            ComplianceRuleSeeder::class,
            UserSeeder::class,
            ZoningApplicationSeeder::class,
        ]);
    }
}
