<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    protected $fillable = [
        'type',
        'title',
        'explanation',
        'passage',
        'audio_url',
        'time',
        'part_number',
        'locked',
        'isBasic',
        'password',
        'exam_id',
        'examContent',
    ];

    public function exam() {
        return $this->belongsTo(Exam::class);
    }

    public function groups() {
        return $this->hasMany(Group::class);
    }
}
