<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ChatTemplate extends Model
{
    protected $fillable = ['category_id', 'question_pattern', 'answer', 'keywords', 'priority'];

    public function category()
    {
        return $this->belongsTo(ChatCategory::class, 'category_id');
    }

    public function messages()
    {
        return $this->hasMany(ChatMessage::class, 'matched_template_id');
    }
}
