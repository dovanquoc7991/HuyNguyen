<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
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
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            // Lấy URL của frontend từ file .env, nếu không có thì dùng giá trị mặc định
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

            // Tạo URL hoàn chỉnh trỏ đến trang reset-password của frontend
            return $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($notifiable->getEmailForPasswordReset());
        });
    }
}
