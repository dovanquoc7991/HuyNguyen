<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Result extends Model
{
    protected $fillable = [
        'user_id',
        'section_id',
        'correct_count',
        'total',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }
}