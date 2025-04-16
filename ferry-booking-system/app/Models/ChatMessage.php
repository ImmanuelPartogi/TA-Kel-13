<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    protected $fillable = ['conversation_id', 'is_from_user', 'message', 'matched_template_id', 'confidence_score'];
    public $timestamps = false;
    protected $casts = [
        'created_at' => 'datetime',
        'is_from_user' => 'boolean',
    ];

    public function conversation()
    {
        return $this->belongsTo(ChatConversation::class, 'conversation_id');
    }

    public function template()
    {
        return $this->belongsTo(ChatTemplate::class, 'matched_template_id');
    }

    public function feedback()
    {
        return $this->hasOne(ChatFeedback::class, 'message_id');
    }
}
