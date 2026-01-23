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
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');
    error_reporting(E_ALL);

    // Set custom error handler to suppress output
    set_error_handler(function ($severity, $message, $file, $line) {
        // Suppress all error output - errors will be logged but not displayed
        return true;
    }, E_ALL);

    // Start output buffering to catch any stray output
    ob_start(function ($buffer) {
        // Discard any output that might break JSON protocol
        return '';
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

        // Fix 419 error for prerequisite verification
        $middleware->validateCsrfTokens(except: [
            'api/verify-prerequisites',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) use ($isMcpMode): void {
        if ($isMcpMode) {
            // Suppress all error output to prevent breaking JSON protocol
            ini_set('display_errors', '0');
            ini_set('log_errors', '1');

            // Suppress error output for all exceptions
            $exceptions->report(function (Throwable $e): void {
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
                return null;
            });
        }
    })->create();
