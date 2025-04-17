<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ChatCategory extends Model
{
    protected $fillable = ['name', 'description'];

    public function templates()
    {
        return $this->hasMany(ChatTemplate::class, 'category_id');
    }
}
