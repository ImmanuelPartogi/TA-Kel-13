<?php

namespace App\Services;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\ChatTemplate;
use Illuminate\Support\Facades\Log;

class ChatbotService
{
    /**
     * Mendapatkan atau membuat percakapan baru
     */
    public function getOrCreateConversation($userId = null, $deviceId = null)
    {
        // Cek apakah pengguna sudah memiliki percakapan yang aktif
        if ($userId) {
            $conversation = ChatConversation::where('user_id', $userId)->latest()->first();
            if ($conversation) {
                return $conversation;
            }
        }

        // Cek apakah ada percakapan berdasarkan session/device ID
        if ($deviceId) {
            $conversation = ChatConversation::where('session_id', $deviceId)->latest()->first();
            if ($conversation) {
                // Update dengan user_id jika user login
                if ($userId && !$conversation->user_id) {
                    $conversation->update(['user_id' => $userId]);
                }
                return $conversation;
            }
        }

        // Jika tidak ada, buat percakapan baru
        return ChatConversation::create([
            'user_id' => $userId,
            'session_id' => $deviceId,
        ]);
    }

    /**
     * Simpan pesan
     */
    public function saveMessage($conversationId, $message, $isFromUser, $templateId = null, $confidenceScore = null)
    {
        return ChatMessage::create([
            'conversation_id' => $conversationId,
            'is_from_user' => $isFromUser,
            'message' => $message,
            'matched_template_id' => $templateId,
            'confidence_score' => $confidenceScore,
            'created_at' => now()
        ]);
    }

    /**
     * Mencari jawaban untuk pesan pengguna
     */
    public function findAnswer($message)
    {
        // Log pesan untuk analisis
        Log::info('Menerima pesan dari pengguna: ' . $message);

        // Bersihkan teks pertanyaan
        $cleanedMessage = $this->cleanText($message);

        // Ekstrak kata kunci dari pesan
        $keywords = $this->extractKeywords($cleanedMessage);

        // Cari template yang cocok
        $bestMatch = $this->findBestTemplate($cleanedMessage, $keywords);

        // Jika tidak ada template yang cocok, berikan respons default
        if (!$bestMatch) {
            Log::warning('Tidak ditemukan template yang cocok untuk: ' . $message);
            return [
                'answer' => 'Maaf, saya belum bisa menjawab pertanyaan tersebut. Silakan tanyakan hal lain terkait layanan feri kami atau hubungi customer service di 0800-123-4567.',
                'template_id' => null,
                'confidence_score' => 0
            ];
        }

        Log::info('Template yang cocok ditemukan: ' . $bestMatch->question_pattern . ' (score: ' . $bestMatch->score . ')');

        return [
            'answer' => $bestMatch->answer,
            'template_id' => $bestMatch->id,
            'confidence_score' => $bestMatch->score
        ];
    }

    /**
     * Membersihkan teks dari karakter khusus dan mengubah ke huruf kecil
     */
    private function cleanText($text)
    {
        // Ubah ke huruf kecil
        $text = strtolower($text);

        // Hapus karakter khusus
        $text = preg_replace('/[^\p{L}\p{N}\s]/u', '', $text);

        // Hapus spasi berlebih
        $text = preg_replace('/\s+/', ' ', $text);

        return trim($text);
    }

    /**
     * Ekstrak kata kunci dari pesan
     */
    private function extractKeywords($text)
    {
        // Stopwords dalam Bahasa Indonesia
        $stopwords = [
            'yang', 'dan', 'di', 'dengan', 'ke', 'pada', 'untuk', 'dari', 'ini', 'itu',
            'atau', 'adalah', 'ada', 'jika', 'maka', 'saya', 'kami', 'kita', 'mereka',
            'dia', 'kamu', 'anda', 'bagaimana', 'kapan', 'dimana', 'mengapa', 'apa', 'apakah',
            'ya', 'tidak', 'bisa', 'boleh', 'harus', 'akan', 'sudah', 'belum', 'telah'
        ];

        // Pisahkan kata-kata
        $words = explode(' ', $text);

        // Filter stopwords
        $keywords = array_filter($words, function($word) use ($stopwords) {
            return !in_array($word, $stopwords) && strlen($word) > 2;
        });

        return array_values($keywords);
    }

    /**
     * Temukan template terbaik berdasarkan kecocokan
     */
    private function findBestTemplate($message, $keywords)
    {
        // Ambil semua template
        $templates = ChatTemplate::all();

        $bestMatch = null;
        $highestScore = 0;

        foreach ($templates as $template) {
            // Hitung skor kecocokan
            $score = $this->calculateMatchScore($message, $keywords, $template);

            // Jika skor lebih tinggi dari yang sebelumnya, update bestMatch
            if ($score > $highestScore) {
                $highestScore = $score;
                $template->score = $score;
                $bestMatch = $template;
            }
        }

        // Jika skor terlalu rendah, anggap tidak ada yang cocok
        if ($highestScore < 0.3) {
            return null;
        }

        return $bestMatch;
    }

    /**
     * Hitung skor kecocokan antara pesan dan template
     */
    private function calculateMatchScore($message, $keywords, $template)
    {
        // Skor dasar
        $score = 0;

        // Pattern matching
        $pattern = $this->cleanText($template->question_pattern);

        // Cek kecocokan langsung
        similar_text($message, $pattern, $similarity);
        $score += ($similarity / 100) * 0.5; // Bobot 50%

        // Cek kecocokan kata kunci
        $templateKeywords = explode(',', $template->keywords);
        $keywordMatches = 0;

        foreach ($keywords as $keyword) {
            foreach ($templateKeywords as $templateKeyword) {
                $templateKeyword = trim($templateKeyword);
                if (strpos($keyword, $templateKeyword) !== false || strpos($templateKeyword, $keyword) !== false) {
                    $keywordMatches++;
                    break;
                }
            }
        }

        $keywordScore = count($keywords) > 0 ? $keywordMatches / count($keywords) : 0;
        $score += $keywordScore * 0.5; // Bobot 50%

        // Prioritas template (0-10)
        $priorityBoost = $template->priority / 10 * 0.1; // Maksimal boost 10%
        $score += $priorityBoost;

        return $score;
    }
}
