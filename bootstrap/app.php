<?php

use App\Http\Middleware\ForceHttps;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

// Detect MCP mode early to suppress error output
$isMcpMode = php_sapi_name() === 'cli'
    && isset($_SERVER['argv'])
    && in_array('boost:mcp', $_SERVER['argv'] ?? [], true);

// Suppress error output early to prevent breaking JSON protocol in MCP mode
if ($isMcpMode) {
    // Override cache driver to use 'array' to avoid database table requirements
    if (! isset($_ENV['CACHE_STORE'])) {
        $_ENV['CACHE_STORE'] = 'array';
        putenv('CACHE_STORE=array');
    }

    // Suppress all error display
    ini_set('display_errors', '0');
    ini_set('display_startup_errors', '0');
    ini_set('log_errors', '1');
    error_reporting(E_ALL);

    // Note: We can't redirect stderr in PHP, but we'll catch all output with handlers and buffers

    // Set custom error handler to suppress all error output
    set_error_handler(function ($severity, $message, $file, $line) {
        // Suppress all error output - errors will be logged but not displayed
        return true;
    }, E_ALL | E_STRICT);

    // Handle fatal errors and shutdown
    register_shutdown_function(function () {
        $error = error_get_last();
        if ($error !== null && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE, E_RECOVERABLE_ERROR], true)) {
            // Suppress fatal error output by cleaning all buffer levels
            $level = ob_get_level();
            for ($i = 0; $i < $level; $i++) {
                ob_clean();
            }
        }
    });

    // Start output buffering with aggressive suppression
    ob_start(function ($buffer) {
        // Discard any output that might break JSON protocol
        return '';
    }, 4096);

    // Also suppress warnings and notices more aggressively
    set_exception_handler(function (Throwable $e) {
        // Suppress all exception output by cleaning all buffer levels
        $level = ob_get_level();
        for ($i = 0; $i < $level; $i++) {
            ob_clean();
        }
    });
}

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Trust proxies for proper HTTPS detection behind load balancers/proxies
        $middleware->trustProxies(at: '*');

        // Force HTTPS middleware (checks environment internally)
        $middleware->web(prepend: [
            ForceHttps::class,
        ]);

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Register API token middleware
        $middleware->alias([
            'api.token' => \App\Http\Middleware\VerifyApiToken::class,
            'module' => \App\Http\Middleware\CheckModuleAccess::class,
        ]);

        // Fix 419 error for prerequisite verification and entry/exit events
        $middleware->validateCsrfTokens(except: [
            'api/verify-prerequisites',
            'api/events/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) use ($isMcpMode): void {
        if ($isMcpMode) {
            // Suppress all error output to prevent breaking JSON protocol
            ini_set('display_errors', '0');
            ini_set('display_startup_errors', '0');
            ini_set('log_errors', '1');

            // Suppress error output for all exceptions
            $exceptions->report(function (Throwable $e): void {
                // Clean any output buffer first to prevent leakage
                $level = ob_get_level();
                for ($i = 0; $i < $level; $i++) {
                    ob_clean();
                }

                // Log the error but don't output to stdout/stderr
                try {
                    if (function_exists('app') && app()->bound('log')) {
                        app('log')->error('MCP Error: '.$e->getMessage(), [
                            'exception' => $e,
                            'trace' => $e->getTraceAsString(),
                        ]);
                    }
                } catch (Throwable $logError) {
                    // If logging fails, silently ignore to prevent breaking JSON
                }
            });

            // Suppress HTTP exception rendering (though MCP doesn't use HTTP)
            $exceptions->render(function (Throwable $e) {
                // Clean output buffer to prevent any leakage
                $level = ob_get_level();
                for ($i = 0; $i < $level; $i++) {
                    ob_clean();
                }

                return null;
            });
        }
    })->create();
