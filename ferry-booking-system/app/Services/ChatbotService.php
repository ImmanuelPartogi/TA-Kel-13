<?php

namespace App\Services;

use App\Models\ChatTemplate;
use App\Models\ChatConversation;
use App\Models\ChatMessage;

class ChatbotService
{
    /**
     * Mencari jawaban berdasarkan pertanyaan pengguna
     */
    public function findAnswer($question)
    {
        // Bersihkan dan persiapkan teks pertanyaan
        $cleanQuestion = strtolower(trim($question));

        // Cari template yang cocok berdasarkan kata kunci atau pola
        $templates = ChatTemplate::orderBy('priority', 'desc')->get();
        $bestMatch = null;
        $highestScore = 0;

        foreach ($templates as $template) {
            $keywords = explode(',', $template->keywords);
            $score = 0;

            // Cek kecocokan kata kunci
            foreach ($keywords as $keyword) {
                $keyword = trim(strtolower($keyword));
                if (!empty($keyword) && strpos($cleanQuestion, $keyword) !== false) {
                    $score += 1;
                }
            }

            // Cek kecocokan pola pertanyaan
            $pattern = $template->question_pattern;
            if (preg_match('/'. preg_quote($pattern, '/') .'/i', $cleanQuestion)) {
                $score += 2;
            }

            // Catat template dengan skor tertinggi
            if ($score > $highestScore) {
                $highestScore = $score;
                $bestMatch = $template;
            }
        }

        // Jika tidak ada kecocokan yang baik, berikan jawaban default
        if ($highestScore <= 0) {
            return [
                'answer' => 'Maaf, saya tidak mengerti pertanyaan Anda. Bisa tolong sampaikan dengan cara lain?',
                'template_id' => null,
                'confidence_score' => 0
            ];
        }

        // Kembalikan jawaban terbaik
        return [
            'answer' => $bestMatch->answer,
            'template_id' => $bestMatch->id,
            'confidence_score' => min(($highestScore / (count(explode(',', $bestMatch->keywords)) + 2)) * 100, 100)
        ];
    }

    /**
     * Menyimpan percakapan baru atau mendapatkan yang sudah ada
     */
    public function getOrCreateConversation($userId = null, $sessionId = null)
    {
        // Gunakan session ID dari parameter atau dari sesi web
        $sessionId = $sessionId ?? session()->getId();

        $conversation = ChatConversation::where('session_id', $sessionId)
            ->when($userId, function ($query) use ($userId) {
                return $query->where('user_id', $userId);
            })
            ->first();

        if (!$conversation) {
            $conversation = ChatConversation::create([
                'user_id' => $userId,
                'session_id' => $sessionId,
            ]);
        } elseif ($userId && !$conversation->user_id) {
            // Update percakapan dengan user_id jika pengguna login
            $conversation->update(['user_id' => $userId]);
        }

        return $conversation;
    }

    /**
     * Menyimpan pesan dalam percakapan
     */
    public function saveMessage($conversationId, $message, $isFromUser = true, $templateId = null, $confidenceScore = null)
    {
        return ChatMessage::create([
            'conversation_id' => $conversationId,
            'is_from_user' => $isFromUser,
            'message' => $message,
            'matched_template_id' => $templateId,
            'confidence_score' => $confidenceScore,
            'created_at' => now(),
        ]);
    }
}
