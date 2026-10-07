<?php

namespace Tests\Feature;

use App\Models\Property;
use Database\Seeders\PropertySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class PortfolioDeploymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_seeding_is_repeatable_without_overwriting_existing_homes(): void
    {
        Artisan::call('db:seed', ['--class' => PropertySeeder::class, '--force' => true]);

        $this->assertDatabaseCount('properties', 3);

        $property = Property::query()->where('slug', 'juniper-house-west-austin')->firstOrFail();
        $property->update(['title' => 'A manually edited title']);

        Artisan::call('db:seed', ['--class' => PropertySeeder::class, '--force' => true]);

        $this->assertDatabaseCount('properties', 3);
        $this->assertSame(
            'A manually edited title',
            Property::query()->whereKey($property->id)->value('title'),
        );
    }
}
