<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;

class AgentController extends Controller
{
    public function index(): JsonResponse
    {
        $agents = User::query()
            ->whereHas('properties', fn ($query) => $query->where('status', 'published'))
            ->withCount(['properties as published_properties_count' => fn ($query) => $query->where('status', 'published')])
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return response()->json($agents);
    }
}
