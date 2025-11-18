<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CheckTokenExpiry
{
    public function handle(Request $request, Closure $next)
{
    $user = $request->user();

    \Log::info('CheckTokenExpiry Middleware triggered');
    \Log::info('User: ' . ($user ? $user->id : 'null'));

    if ($user && $user->currentAccessToken()) {
        $token = $user->currentAccessToken();
        $createdAt = $token->created_at;

        \Log::info('Token created at: ' . $createdAt);
        \Log::info('Current time: ' . Carbon::now());
        \Log::info('Difference in minutes: ' . $createdAt->diffInHours(Carbon::now()));

        if ($createdAt->diffInHours(Carbon::now()) >= 1) {
            \Log::info('Token expired, deleting...');
            $token->delete();
            return response()->json(['message' => 'Session expired'], 401);
        }
    }

    return $next($request);
}
}
