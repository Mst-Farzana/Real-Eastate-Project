<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        $agents = collect([
            ['name' => 'Northstar Estates', 'email' => 'hello@northstarestates.com'],
            ['name' => 'Maya Chen', 'email' => 'maya@northstarestates.com'],
            ['name' => 'Theo Morgan', 'email' => 'theo@northstarestates.com'],
        ])->mapWithKeys(fn ($agent) => [$agent['email'] => User::firstOrCreate(
            ['email' => $agent['email']],
            ['name' => $agent['name'], 'password' => 'password'],
        )]);
        $amenities = collect(['Natural light', 'Garden', 'Parking', 'Home office'])->mapWithKeys(fn ($name) => [$name => Amenity::firstOrCreate(['slug' => str($name)->slug()], ['name' => $name])]);

        $listings = [
            ['agent_id' => $agents['hello@northstarestates.com']->id, 'slug' => 'juniper-house-west-austin', 'title' => 'The Juniper House', 'description' => 'A light-filled modern home with a calm connection to the landscape.', 'listing_type' => 'sale', 'property_type' => 'single_family', 'price' => 1295000, 'currency' => 'USD', 'bedrooms' => 4, 'bathrooms' => 3.5, 'area_sqft' => 2840, 'address_line' => '1804 Juniper Lane', 'city' => 'Austin', 'state' => 'TX', 'country' => 'US', 'postal_code' => '78704', 'image' => 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', 'alt' => 'The Juniper House living room', 'is_featured' => true],
            ['agent_id' => $agents['maya@northstarestates.com']->id, 'slug' => 'wellington-mews-bloomsbury', 'title' => 'Wellington Mews', 'description' => 'A quietly elegant London home with original details and generous natural light.', 'listing_type' => 'sale', 'property_type' => 'townhouse', 'price' => 895000, 'currency' => 'GBP', 'bedrooms' => 3, 'bathrooms' => 2, 'area_sqft' => 1560, 'address_line' => '14 Wellington Mews', 'city' => 'London', 'state' => null, 'country' => 'GB', 'postal_code' => 'WC1', 'image' => 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3', 'alt' => 'Wellington Mews interior', 'is_featured' => true],
            ['agent_id' => $agents['theo@northstarestates.com']->id, 'slug' => 'clinton-hill-loft-brooklyn', 'title' => 'Clinton Hill Loft', 'description' => 'A warm Brooklyn loft with tall windows, clean lines, and room to settle in.', 'listing_type' => 'rent', 'property_type' => 'apartment', 'price' => 6800, 'currency' => 'USD', 'bedrooms' => 2, 'bathrooms' => 2, 'area_sqft' => 1120, 'address_line' => '82 Vanderbilt Avenue', 'city' => 'Brooklyn', 'state' => 'NY', 'country' => 'US', 'postal_code' => '11205', 'image' => 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0', 'alt' => 'Clinton Hill Loft interior', 'is_featured' => false],
        ];

        foreach ($listings as $listing) {
            $property = Property::updateOrCreate(['slug' => $listing['slug']], [
                ...collect($listing)->except(['image', 'alt'])->all(),
                'status' => 'published', 'published_at' => now(),
            ]);
            $property->amenities()->sync($amenities->pluck('id'));
            $property->images()->updateOrCreate(['url' => $listing['image']], ['alt_text' => $listing['alt'], 'is_cover' => true]);
        }
    }
}
