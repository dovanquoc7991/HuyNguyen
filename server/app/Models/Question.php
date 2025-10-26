<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $casts = [
        'options' => 'array',
        'answers' => 'array',
    ];

    protected $fillable = [
        'number',
        'question',
        'answers',
        'options',
    ];

    public function groups() {
        return $this->belongsTo(Group::class);
    }
}
