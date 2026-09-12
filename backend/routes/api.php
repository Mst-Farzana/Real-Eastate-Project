<?php

use App\Http\Controllers\PropertyController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AgentController;
use Illuminate\Support\Facades\Route;

Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/{property:slug}', [PropertyController::class, 'show']);
Route::post('/properties/{property:slug}/inquiries', [PropertyController::class, 'inquire']);
Route::get('/agents', [AgentController::class, 'index']);

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
	Route::get('/auth/me', [AuthController::class, 'me']);
	Route::post('/auth/logout', [AuthController::class, 'logout']);
});
