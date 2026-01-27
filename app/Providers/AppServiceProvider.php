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
