<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyImage extends Model
{
    protected $fillable = ['property_id', 'url', 'alt_text', 'sort_order', 'is_cover'];
    protected function casts(): array { return ['is_cover' => 'boolean']; }
    public function property(): BelongsTo { return $this->belongsTo(Property::class); }
}
