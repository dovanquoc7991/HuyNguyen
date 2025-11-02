<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class CheckUserStatus
{
    /**
     * Nếu user login:
     *  - logout nếu user->status !== 'active' hoặc expires_at < now()
     *  - logout nếu thời gian từ login_at vượt quá session.lifetime (phút)
     */
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();

            // Kiểm tra trạng thái / expires_at
            if ($user->status !== 'active' || ($user->expires_at && Carbon::parse($user->expires_at)->lt(now()))) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                if ($request->expectsJson()) {
                    return response()->json(['message' => 'Tài khoản không hoạt động. Vui lòng đăng nhập lại.'], 401);
                }

                return redirect()->route('login')->with('error', 'Tài khoản của bạn hiện không còn hoạt động.');
            }

            // Thiết lập login_at nếu chưa có
            if (!$request->session()->has('login_at')) {
                $request->session()->put('login_at', now()->toDateTimeString());
            } else {
                $loginAt = Carbon::parse($request->session()->get('login_at'));
                $lifetimeMinutes = (int) config('session.lifetime', 360);
                if ($loginAt->diffInMinutes(now()) >= $lifetimeMinutes) {
                    Auth::logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    if ($request->expectsJson()) {
                        return response()->json(['message' => 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.'], 401);
                    }

                    return redirect()->route('login')->with('error', 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
                }
            }
        }

        return $next($request);
    }
}