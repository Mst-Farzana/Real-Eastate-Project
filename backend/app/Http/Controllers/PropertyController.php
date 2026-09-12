<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $properties = Property::query()
            ->where('status', 'published')
            ->when($request->string('city')->isNotEmpty(), fn ($query) => $query->where('city', 'like', '%'.$request->string('city').'%'))
            ->when($request->string('listing_type')->isNotEmpty(), fn ($query) => $query->where('listing_type', $request->string('listing_type')))
            ->when($request->string('property_type')->isNotEmpty(), fn ($query) => $query->where('property_type', $request->string('property_type')))
            ->when($request->filled('min_price'), fn ($query) => $query->where('price', '>=', $request->float('min_price')))
            ->when($request->filled('max_price'), fn ($query) => $query->where('price', '<=', $request->float('max_price')))
            ->when($request->boolean('featured'), fn ($query) => $query->where('is_featured', true))
            ->with(['images', 'amenities', 'agent:id,name,email'])
            ->latest('published_at')
            ->paginate($request->integer('per_page', 12));

        return response()->json($properties);
    }

    public function show(Property $property): JsonResponse
    {
        abort_unless($property->status === 'published', 404);
        return response()->json($property->load(['images', 'amenities', 'agent:id,name,email']));
    }

    public function inquire(Request $request, Property $property): JsonResponse
    {
        abort_unless($property->status === 'published', 404);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'message' => ['required', 'string', 'max:3000'],
        ]);

        $inquiry = $property->inquiries()->create([...$validated, 'user_id' => $request->user()?->id]);
        return response()->json(['message' => 'Your inquiry has been received.', 'inquiry' => $inquiry], 201);
    }
}
