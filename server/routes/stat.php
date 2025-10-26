<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


use App\Http\Controllers\StatController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/stats', [StatController::class, 'showStats']);
});
