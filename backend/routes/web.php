<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// 🔧 Debug Route - 500 Error দেখার জন্য
Route::get('/check-error', function () {
    $logPath = storage_path('logs/laravel.log');
    if (file_exists($logPath)) {
        $lines = file($logPath);
        $lastLines = array_slice($lines, -50);
        return '<pre style="background:#111; color:#0f0; padding:20px; font-size:13px; overflow-x:auto;">' . implode('', $lastLines) . '</pre>';
    }
    return '<h2 style="color:red">Log file পাওয়া যায়নি!</h2>';
});
