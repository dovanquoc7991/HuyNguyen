<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    protected $casts = [
        'choices' => 'array',
    ];

    protected $fillable = [
        'instruction',
        'type',
        'paragraph',
        'imgContent',
        'choices',
    ];

    public function sections() {
        return $this->belongsTo(Section::class);
    }

    public function questions() {
        return $this->hasMany(Question::class);
    }
}
