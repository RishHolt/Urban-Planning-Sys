<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Override cache driver to 'array' in MCP mode to avoid database table requirements
        $isMcpMode = php_sapi_name() === 'cli'
            && isset($_SERVER['argv'])
            && in_array('boost:mcp', $_SERVER['argv'] ?? [], true);

        if ($isMcpMode) {
            config(['cache.default' => 'array']);

            // Suppress any errors during boot in MCP mode
            try {
                $this->bootServices();
            } catch (\Throwable $e) {
                // Silently suppress errors in MCP mode to prevent breaking JSON protocol
                if (function_exists('app') && app()->bound('log')) {
                    app('log')->error('MCP Boot Error: '.$e->getMessage(), [
                        'exception' => $e,
                    ]);
                }
            }
        } else {
            $this->bootServices();
        }
    }

    /**
     * Boot application services.
     */
    private function bootServices(): void
    {
        // Load migrations from module subdirectories
        $migrationModules = ['zcs_db', 'hbr_db', 'sbr_db', 'omt_db', 'ipc_db'];

        foreach ($migrationModules as $module) {
            $modulePath = database_path("migrations/{$module}");
            if (is_dir($modulePath)) {
                $this->loadMigrationsFrom($modulePath);
            }
        }
    }
}
