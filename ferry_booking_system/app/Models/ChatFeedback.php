<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ChatFeedback extends Model
{
    protected $fillable = ['message_id', 'is_helpful', 'feedback_text'];
    public $timestamps = false;
    protected $casts = [
        'created_at' => 'datetime',
        'is_helpful' => 'boolean',
    ];

    public function message()
    {
        return $this->belongsTo(ChatMessage::class, 'message_id');
    }
}
