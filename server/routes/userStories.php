<?php
use App\Http\Controllers\UserResultController;

Route::middleware('auth:sanctum')->get('/user/last-result', [UserResultController::class, 'lastResult']);   
Route::middleware('auth:sanctum')->post('/user/save-result', [UserResultController::class, 'saveResult']);