<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('listing_type', ['sale', 'rent']);
            $table->string('property_type');
            $table->decimal('price', 14, 2);
            $table->char('currency', 3)->default('USD');
            $table->unsignedSmallInteger('bedrooms')->default(0);
            $table->decimal('bathrooms', 3, 1)->default(0);
            $table->unsignedInteger('area_sqft')->nullable();
            $table->string('address_line');
            $table->string('city');
            $table->string('state')->nullable();
            $table->string('country', 2);
            $table->string('postal_code')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->index(['country', 'city', 'listing_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
