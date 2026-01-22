<?php

/**
 * Script to refresh all databases for multi-database setup
 * Run with: php database/refresh-all-databases.php
 */

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$connections = ['user_db', 'zcs_db', 'hbr_db', 'omt_db', 'sbr_db', 'ipc_db'];

echo "Dropping all tables from all databases...\n\n";

foreach ($connections as $connection) {
    echo "Processing {$connection}...\n";

    try {
        $tables = DB::connection($connection)->select('SHOW TABLES');
        $tableKey = 'Tables_in_'.DB::connection($connection)->getDatabaseName();

        if (! empty($tables)) {
            DB::connection($connection)->statement('SET FOREIGN_KEY_CHECKS=0');

            foreach ($tables as $table) {
                $tableName = $table->$tableKey;
                echo "  Dropping table: {$tableName}\n";
                Schema::connection($connection)->dropIfExists($tableName);
            }

            DB::connection($connection)->statement('SET FOREIGN_KEY_CHECKS=1');
            echo "  ✓ All tables dropped from {$connection}\n";
        } else {
            echo "  ✓ No tables to drop in {$connection}\n";
        }
    } catch (\Exception $e) {
        echo "  ✗ Error: {$e->getMessage()}\n";
    }

    echo "\n";
}

echo "All databases refreshed! You can now run: php artisan migrate\n";
