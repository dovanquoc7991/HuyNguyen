<?php

use App\Http\Controllers\PostController;
use App\Http\Controllers\FeedbackController; // Thêm dòng này


require __DIR__.'/auth.php';
require __DIR__.'/exam.php';
require __DIR__.'/stat.php';
require __DIR__.'/userStories.php';

Route::apiResource('posts', PostController::class)->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    // Feedback Routes
    Route::post('/feedback', [FeedbackController::class, 'store']);
    Route::get('/feedback', [FeedbackController::class, 'index']);
    Route::put('/feedback/{feedback}/status', [FeedbackController::class, 'updateStatus']);
    Route::delete('/feedback/{feedback}', [FeedbackController::class, 'destroy']);
});
