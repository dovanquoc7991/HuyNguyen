<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


use App\Http\Controllers\ExamController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/exam/content/reading/{id}', [ExamController::class, 'showReading']);
    Route::get('/exam/content/{id}', [ExamController::class, 'showFullExam']);
    Route::post('/exam/new/reading', [ExamController::class, 'storeReading']);
    Route::post('/exam/new/listening', [ExamController::class, 'storeListening']);
    Route::post('/exam/new/writing', [ExamController::class, 'storeWriting']);
    Route::post('/exam/new/speaking', [ExamController::class, 'storeSpeaking']);
    Route::post('/exam/new', [ExamController::class, 'storeExam']);
    Route::get('/exam/list/reading', [ExamController::class, 'showReadingList']);
    Route::get('/exam/list/listening', [ExamController::class, 'showListeningList']);
    Route::get('/exam/list/part/reading/{id}', [ExamController::class, 'showReadingPartList']);
    Route::get('/exam/list/part/listening/{id}', [ExamController::class, 'showListeningPartList']);
    Route::get('/exam/list/part/reading', [ExamController::class, 'showReadingPartListByType']);
    Route::get('/exam/list/part/listening', [ExamController::class, 'showListeningPartListByType']);
    Route::get('/exam/list/part/writing', [ExamController::class, 'showWritingPartListByType']);
    Route::get('/exam/list/part/speaking', [ExamController::class, 'showSpeakingPartListByType']);
    Route::get('/section/{id}', [ExamController::class, 'getSectionById']);
    Route::delete('/exam/delete/{id}', [ExamController::class, 'deleteTest']);
    // Route để cập nhật bài thi, sử dụng route model binding
    Route::put('/exam/update/{exam}', [ExamController::class, 'update']);
    // Route để cập nhật một section cụ thể
    Route::put('/sections/update/{section}', [ExamController::class, 'updateSection']);
});
