<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;

    protected $table = 'feedbacks'; // Khai báo rõ ràng tên bảng là 'feedbacks'

    protected $fillable = [
        'user_id',
        'content',
        'context',
        'status',
    ];

    protected $casts = [
        'context' => 'array',
    ];

    /**
     * Lấy thông tin người dùng đã gửi feedback.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
