<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stat extends Model
{
    protected $fillable = [
        'user_id',
        'latest_reading_score',
        'latest_listening_score',
        'total_listening_completed',
        'total_reading_completed',
        'best_reading_score',
        'best_listening_score',
        'average_reading_score',
        'average_listening_score',
    ];

    public function users() {
        return $this->belongsTo(User::class);
    }

    public static function createDefaultForUser($user_id)
    {
        return self::create([
            'user_id' => $user_id,
            'latest_reading_score' => 0,
            'latest_listening_score' => 0,
            'total_listening_completed' => 0,
            'total_reading_completed' => 0,
            'best_reading_score' => 0,
            'best_listening_score' => 0,
            'average_reading_score' => 0,
            'average_listening_score' => 0,
        ]);
    }
}
