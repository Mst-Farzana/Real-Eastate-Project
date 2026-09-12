<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id', 'title', 'slug', 'description', 'listing_type', 'property_type',
        'price', 'currency', 'bedrooms', 'bathrooms', 'area_sqft', 'address_line',
        'city', 'state', 'country', 'postal_code', 'latitude', 'longitude',
        'status', 'is_featured', 'published_at',
    ];

    protected function casts(): array
    {
        return ['price' => 'decimal:2', 'bathrooms' => 'decimal:1', 'latitude' => 'decimal:7', 'longitude' => 'decimal:7', 'is_featured' => 'boolean', 'published_at' => 'datetime'];
    }

    public function agent(): BelongsTo { return $this->belongsTo(User::class, 'agent_id'); }
    public function images(): HasMany { return $this->hasMany(PropertyImage::class)->orderBy('sort_order'); }
    public function amenities(): BelongsToMany { return $this->belongsToMany(Amenity::class); }
    public function inquiries(): HasMany { return $this->hasMany(Inquiry::class); }
    public function savedBy(): BelongsToMany { return $this->belongsToMany(User::class, 'saved_properties'); }
}
