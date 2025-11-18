<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

Route::get('/{any?}', function () {
    // Luôn trả về file index.html của React app cho mọi request không phải API.
    // Điều này cho phép React Router (wouter) xử lý việc định tuyến ở phía client.
    // Trên shared hosting, web root thường là 'httpdocs'.
    // base_path() trỏ đến thư mục gốc của Laravel, sau đó chúng ta trỏ đến file index.html trong httpdocs.
    return File::get(base_path('index.html'));
})->where('any', '.*');
