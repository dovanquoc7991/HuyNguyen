<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Password Reset
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('password.email');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::post('/token/revoke', [AuthController::class, 'revokeToken']);
    Route::post('/password/change', [AuthController::class, 'changePassword']);
    Route::get('/users', [UserController::class, 'index']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    Route::put('/users/{user}/status', [UserController::class, 'updateStatus']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::post('/users/bulk-delete', [UserController::class, 'bulkDestroy']);
    Route::post('/users/bulk-status-update', [UserController::class, 'bulkUpdateStatus']);
    Route::post('/users/bulk-expiry-update', [UserController::class, 'bulkUpdateExpiry']);
});
