<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyApiToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (! $token) {
            return $this->unauthorizedResponse('No token provided');
        }

        if (! $this->isValidToken($token)) {
            return $this->unauthorizedResponse('Invalid token');
        }

        return $next($request);
    }

    /**
     * Validate the API token.
     */
    private function isValidToken(string $token): bool
    {
        // Option 1: Check against environment variable (simple, for testing)
        $validToken = config('app.api_token');
        if ($validToken && $token === $validToken) {
            return true;
        }

        // Option 2: Check against database (uncomment when you create ApiToken model)
        // return \App\Models\ApiToken::where('token', hash('sha256', $token))
        //     ->where('is_active', true)
        //     ->exists();

        // Option 3: Multiple tokens from config (comma-separated)
        $validTokens = config('app.api_tokens', []);
        if (is_string($validTokens)) {
            $validTokens = explode(',', $validTokens);
        }
        if (is_array($validTokens) && in_array($token, $validTokens)) {
            return true;
        }

        return false;
    }

    /**
     * Return unauthorized response.
     */
    private function unauthorizedResponse(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => 'Unauthorized',
            'message' => $message,
        ], 401);
    }
}
