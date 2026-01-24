<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Creates the application.
     */
    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';

        $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

        // Remap all application specific connections to use the default sqlite connection from phpunit.xml
        $connections = ['user_db', 'zcs_db', 'hbr_db', 'omt_db', 'sbr_db', 'ipc_db'];
        foreach ($connections as $connection) {
            $app['config']->set(["database.connections.{$connection}" => $app['config']->get('database.connections.sqlite')]);
        }

        return $app;
    }
}
