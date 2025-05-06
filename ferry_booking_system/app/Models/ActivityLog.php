<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'activity_type',
        'description',
        'status',
        'reference_id',
        'reference_type'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function schedule()
    {
        return $this->belongsTo(Schedule::class, 'reference_id')
            ->where('reference_type', 'schedule');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'reference_id')
            ->where('reference_type', 'booking');
    }
}
