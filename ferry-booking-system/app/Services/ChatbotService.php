<?php

namespace App\Services;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\ChatTemplate;
use App\Models\ChatCategory;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ChatbotService
{
    /**
     * Mendapatkan atau membuat percakapan baru
     */
    public function getOrCreateConversation($userId = null, $deviceId = null)
    {
        // Cek apakah pengguna sudah memiliki percakapan yang aktif
        if ($userId) {
            $conversation = ChatConversation::where('user_id', $userId)
                            ->latest()
                            ->first();
            if ($conversation) {
                return $conversation;
            }
        }

        // Cek apakah ada percakapan berdasarkan session/device ID
        if ($deviceId) {
            $conversation = ChatConversation::where('session_id', $deviceId)
                            ->latest()
                            ->first();
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
            'context' => json_encode([
                'last_category_id' => null,
                'recent_keywords' => [],
                'chat_count' => 0,
                'unanswered_count' => 0
            ])
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
    public function findAnswer($message, $conversationId = null)
    {
        // Log pesan untuk analisis
        Log::info('Menerima pesan dari pengguna: ' . $message);

        // Bersihkan teks pertanyaan
        $cleanedMessage = $this->cleanText($message);

        // Ekstrak kata kunci dari pesan
        $keywords = $this->extractKeywords($cleanedMessage);

        // Dapatkan konteks percakapan jika ada
        $context = $this->getConversationContext($conversationId);

        // Cari template yang cocok dengan memperhatikan konteks
        $bestMatch = $this->findBestTemplate($cleanedMessage, $keywords, $context);

        // Jika tidak ada template yang cocok, berikan respons default
        if (!$bestMatch) {
            Log::warning('Tidak ditemukan template yang cocok untuk: ' . $message);

            // Update konteks untuk mencatat pertanyaan tidak terjawab
            if ($conversationId) {
                $this->updateContextForUnansweredQuestion($conversationId, $context);
            }

            // Coba berikan jawaban fallback berdasarkan kategori terakhir jika ada
            if (isset($context['last_category_id']) && $context['last_category_id']) {
                $fallbackResponse = $this->generateFallbackResponse($context['last_category_id']);
                if ($fallbackResponse) {
                    return $fallbackResponse;
                }
            }

            return [
                'answer' => 'Maaf, saya belum bisa menjawab pertanyaan tersebut. Silakan tanyakan hal lain terkait layanan feri kami atau hubungi customer service di 0800-123-4567.',
                'template_id' => null,
                'confidence_score' => 0,
                'suggested_questions' => $this->getSuggestedQuestions($keywords)
            ];
        }

        Log::info('Template yang cocok ditemukan: ' . $bestMatch->question_pattern . ' (score: ' . $bestMatch->score . ')');

        // Update konteks percakapan
        if ($conversationId) {
            $this->updateConversationContext($conversationId, $context, $keywords, $bestMatch);
        }

        return [
            'answer' => $this->processTemplateAnswer($bestMatch->answer, $context),
            'template_id' => $bestMatch->id,
            'confidence_score' => $bestMatch->score,
            'category_id' => $bestMatch->category_id,
            'suggested_questions' => $this->getRelatedQuestions($bestMatch->category_id, $bestMatch->id)
        ];
    }

    /**
     * Memproses jawaban template untuk personalisasi
     */
    private function processTemplateAnswer($answer, $context)
    {
        // Jika ada variabel yang perlu dimasukkan ke dalam template
        // misalnya nama pengguna, data terakhir dicari, dll
        $processedAnswer = $answer;

        // Contoh: jika kita memiliki data pengguna di konteks
        if (isset($context['user_name']) && $context['user_name']) {
            $processedAnswer = str_replace('{user_name}', $context['user_name'], $processedAnswer);
        }

        return $processedAnswer;
    }

    /**
     * Mendapatkan konteks percakapan
     */
    private function getConversationContext($conversationId)
    {
        if (!$conversationId) {
            return [
                'last_category_id' => null,
                'recent_keywords' => [],
                'chat_count' => 0,
                'unanswered_count' => 0
            ];
        }

        $conversation = ChatConversation::find($conversationId);
        if (!$conversation || !$conversation->context) {
            return [
                'last_category_id' => null,
                'recent_keywords' => [],
                'chat_count' => 0,
                'unanswered_count' => 0
            ];
        }

        return json_decode($conversation->context, true);
    }

    /**
     * Update konteks percakapan setelah menemukan template yang cocok
     */
    private function updateConversationContext($conversationId, $context, $keywords, $bestMatch)
    {
        // Update data konteks
        $context['last_category_id'] = $bestMatch->category_id;
        $context['chat_count'] = ($context['chat_count'] ?? 0) + 1;

        // Simpan keywords terbaru (maksimal 10)
        $recentKeywords = $context['recent_keywords'] ?? [];
        $recentKeywords = array_merge($recentKeywords, $keywords);
        $recentKeywords = array_unique($recentKeywords);
        $context['recent_keywords'] = array_slice($recentKeywords, 0, 10);

        // Simpan konteks yang diperbarui ke database
        $conversation = ChatConversation::find($conversationId);
        if ($conversation) {
            $conversation->update(['context' => json_encode($context)]);
        }
    }

    /**
     * Update konteks untuk pertanyaan yang tidak terjawab
     */
    private function updateContextForUnansweredQuestion($conversationId, $context)
    {
        // Tingkatkan hitungan pertanyaan tidak terjawab
        $context['unanswered_count'] = ($context['unanswered_count'] ?? 0) + 1;

        // Jika banyak pertanyaan tidak terjawab, kita mungkin ingin menandai untuk eskalasi
        if ($context['unanswered_count'] >= 3) {
            $context['needs_human_help'] = true;
        }

        // Simpan konteks yang diperbarui
        $conversation = ChatConversation::find($conversationId);
        if ($conversation) {
            $conversation->update(['context' => json_encode($context)]);
        }
    }

    /**
     * Dapatkan pertanyaan terkait berdasarkan kategori
     */
    private function getRelatedQuestions($categoryId, $excludeTemplateId)
    {
        $relatedTemplates = ChatTemplate::where('category_id', $categoryId)
            ->where('id', '!=', $excludeTemplateId)
            ->orderBy('priority', 'desc')
            ->take(3)
            ->get(['id', 'question_pattern']);

        $suggestedQuestions = [];
        foreach ($relatedTemplates as $template) {
            $suggestedQuestions[] = [
                'id' => $template->id,
                'question' => $template->question_pattern
            ];
        }

        return $suggestedQuestions;
    }

    /**
     * Dapatkan pertanyaan yang disarankan berdasarkan kata kunci
     */
    private function getSuggestedQuestions($keywords)
    {
        if (empty($keywords)) {
            // Jika tidak ada kata kunci, berikan pertanyaan populer
            $popularTemplates = ChatTemplate::orderBy('priority', 'desc')
                ->take(3)
                ->get(['id', 'question_pattern']);

            $suggestedQuestions = [];
            foreach ($popularTemplates as $template) {
                $suggestedQuestions[] = [
                    'id' => $template->id,
                    'question' => $template->question_pattern
                ];
            }

            return $suggestedQuestions;
        }

        // Cari template yang mungkin terkait dengan kata kunci
        $keyword = $keywords[0]; // Gunakan kata kunci pertama sebagai contoh

        $templates = ChatTemplate::whereRaw('LOWER(keywords) LIKE ?', ['%' . strtolower($keyword) . '%'])
            ->orderBy('priority', 'desc')
            ->take(3)
            ->get(['id', 'question_pattern']);

        $suggestedQuestions = [];
        foreach ($templates as $template) {
            $suggestedQuestions[] = [
                'id' => $template->id,
                'question' => $template->question_pattern
            ];
        }

        return $suggestedQuestions;
    }

    /**
     * Menghasilkan respons fallback berdasarkan kategori terakhir
     */
    private function generateFallbackResponse($categoryId)
    {
        $category = ChatCategory::find($categoryId);
        if (!$category) {
            return null;
        }

        // Berikan respons fallback berdasarkan kategori
        return [
            'answer' => "Maaf, saya belum dapat menjawab secara spesifik tentang pertanyaan Anda mengenai {$category->name}. Tapi saya dapat membantu Anda dengan pertanyaan lain terkait kategori ini.",
            'template_id' => null,
            'confidence_score' => 0.1,
            'category_id' => $categoryId,
            'suggested_questions' => $this->getQuestionsFromCategory($categoryId)
        ];
    }

    /**
     * Dapatkan pertanyaan dari kategori tertentu
     */
    private function getQuestionsFromCategory($categoryId)
    {
        $templates = ChatTemplate::where('category_id', $categoryId)
            ->orderBy('priority', 'desc')
            ->take(3)
            ->get(['id', 'question_pattern']);

        $suggestedQuestions = [];
        foreach ($templates as $template) {
            $suggestedQuestions[] = [
                'id' => $template->id,
                'question' => $template->question_pattern
            ];
        }

        return $suggestedQuestions;
    }

    /**
     * Membersihkan teks dari karakter khusus dan mengubah ke huruf kecil
     */
    private function cleanText($text)
    {
        // Ubah ke huruf kecil
        $text = strtolower($text);

        // Hapus karakter khusus tapi pertahankan tanda tanya untuk analisis pertanyaan
        $text = preg_replace('/[^\p{L}\p{N}\s\?]/u', '', $text);

        // Hapus spasi berlebih
        $text = preg_replace('/\s+/', ' ', $text);

        return trim($text);
    }

    /**
     * Ekstrak kata kunci dari pesan
     */
    private function extractKeywords($text)
    {
        // Stopwords dalam Bahasa Indonesia - diperluas untuk lebih akurat
        $stopwords = [
            'yang', 'dan', 'di', 'dengan', 'ke', 'pada', 'untuk', 'dari', 'ini', 'itu',
            'atau', 'adalah', 'ada', 'jika', 'maka', 'saya', 'kami', 'kita', 'mereka',
            'dia', 'kamu', 'anda', 'bagaimana', 'kapan', 'dimana', 'mengapa', 'apa',
            'apakah', 'ya', 'tidak', 'bisa', 'boleh', 'harus', 'akan', 'sudah', 'belum',
            'telah', 'oleh', 'sebagai', 'juga', 'tentang', 'hal', 'dapat', 'secara',
            'sangat', 'hanya', 'mungkin', 'setiap', 'semua', 'saat', 'sedang', 'masih',
            'lagi', 'tapi', 'namun', 'karena', 'ketika', 'sebelum', 'sesudah', 'selama',
            'bahwa', 'sampai', 'hingga', 'seperti', 'sebab', 'akibat', 'jadi', 'agar',
            'supaya', 'sehingga', 'tetapi', 'melainkan', 'selain', 'kecuali', 'terhadap',
            'mengenai', 'melalui', 'berdasarkan', 'menurut', 'sesuai'
        ];

        // Deteksi tipe pertanyaan berdasarkan kata tanya
        $questionIndicators = ['apa', 'bagaimana', 'kapan', 'dimana', 'mengapa', 'siapa', 'berapa', 'kenapa'];
        $questionType = null;

        // Pisahkan kata-kata
        $words = explode(' ', $text);

        // Identifikasi tipe pertanyaan jika ada
        foreach ($words as $word) {
            if (in_array($word, $questionIndicators)) {
                $questionType = $word;
                break;
            }
        }

        // Filter stopwords
        $keywords = array_filter($words, function ($word) use ($stopwords) {
            return !in_array($word, $stopwords) && strlen($word) > 2;
        });

        // Tambahkan tipe pertanyaan sebagai kata kunci jika ada
        $result = array_values($keywords);
        if ($questionType && !in_array($questionType, $result)) {
            array_unshift($result, $questionType);
        }

        return $result;
    }

    /**
     * Temukan template terbaik berdasarkan kecocokan dengan algoritma yang ditingkatkan
     */
    private function findBestTemplate($message, $keywords, $context = null)
    {
        // Gunakan cache untuk mempercepat jika pesan sering ditanyakan
        $cacheKey = 'chatbot_template_' . md5($message);
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        // Ambil semua template
        $templates = ChatTemplate::all();

        $bestMatch = null;
        $highestScore = 0;
        $secondHighestScore = 0;
        $secondBestMatch = null;

        // Faktor bobot untuk konteks percakapan
        $contextBoost = 0.15; // Maksimal 15% boost untuk konteks

        foreach ($templates as $template) {
            // Hitung skor kecocokan dengan algoritma yang ditingkatkan
            $score = $this->calculateEnhancedMatchScore($message, $keywords, $template);

            // Tambahkan bobot kontekstual jika ada konteks
            if ($context && isset($context['last_category_id']) && $context['last_category_id'] == $template->category_id) {
                $score += $contextBoost;
            }

            // Tambahkan bobot untuk kata kunci yang baru-baru ini disebutkan
            if ($context && isset($context['recent_keywords']) && !empty($context['recent_keywords'])) {
                $keywordBoost = $this->calculateKeywordContextBoost($template, $context['recent_keywords']);
                $score += $keywordBoost;
            }

            // Jika skor lebih tinggi dari yang sebelumnya, update bestMatch
            if ($score > $highestScore) {
                $secondHighestScore = $highestScore;
                $secondBestMatch = $bestMatch;

                $highestScore = $score;
                $template->score = $score;
                $bestMatch = $template;
            } else if ($score > $secondHighestScore) {
                $secondHighestScore = $score;
                $template->score = $score;
                $secondBestMatch = $template;
            }
        }

        // Jika skor terlalu rendah atau beda dengan kedua skor teratas terlalu kecil (ambiguitas tinggi)
        if ($highestScore < 0.4) {
            return null;
        }

        // Simpan hasil ke cache selama 1 jam untuk optimasi performa
        if ($bestMatch) {
            Cache::put($cacheKey, $bestMatch, 3600);
        }

        return $bestMatch;
    }

    /**
     * Hitung bobot kontekstual untuk kata kunci yang baru disebutkan
     */
    private function calculateKeywordContextBoost($template, $recentKeywords)
    {
        $templateKeywords = explode(',', $template->keywords);
        $matchCount = 0;

        foreach ($templateKeywords as $templateKeyword) {
            $templateKeyword = trim($templateKeyword);
            foreach ($recentKeywords as $recentKeyword) {
                if (stripos($templateKeyword, $recentKeyword) !== false || stripos($recentKeyword, $templateKeyword) !== false) {
                    $matchCount++;
                }
            }
        }

        // Maksimal boost 10% untuk kata kunci terkait konteks
        return min(0.1, $matchCount * 0.02);
    }

    /**
     * Hitung skor kecocokan dengan algoritma yang ditingkatkan
     */
    private function calculateEnhancedMatchScore($message, $keywords, $template)
    {
        // Skor dasar
        $score = 0;

        // Pattern matching
        $pattern = $this->cleanText($template->question_pattern);

        // TF-IDF like scoring dengan kesamaan teks
        $messageWords = explode(' ', $message);
        $patternWords = explode(' ', $pattern);

        // Hitung term frequency untuk pesan dan pattern
        $messageTF = array_count_values($messageWords);
        $patternTF = array_count_values($patternWords);

        // Hitung cosine similarity berdasarkan vector terms
        $dotProduct = 0;
        $magnitudeMessage = 0;
        $magnitudePattern = 0;

        $allTerms = array_unique(array_merge(array_keys($messageTF), array_keys($patternTF)));

        foreach ($allTerms as $term) {
            $mTF = isset($messageTF[$term]) ? $messageTF[$term] : 0;
            $pTF = isset($patternTF[$term]) ? $patternTF[$term] : 0;

            $dotProduct += $mTF * $pTF;
            $magnitudeMessage += $mTF * $mTF;
            $magnitudePattern += $pTF * $pTF;
        }

        $magnitudeMessage = sqrt($magnitudeMessage);
        $magnitudePattern = sqrt($magnitudePattern);

        $cosineSimilarity = 0;
        if ($magnitudeMessage > 0 && $magnitudePattern > 0) {
            $cosineSimilarity = $dotProduct / ($magnitudeMessage * $magnitudePattern);
        }

        // Tambahkan skor cosine similarity (30%)
        $score += $cosineSimilarity * 0.3;

        // Tambahkan skor Levenshtein yang dinormalisasi (20%)
        $messageLength = strlen($message);
        $patternLength = strlen($pattern);
        $maxLength = max($messageLength, $patternLength);

        if ($maxLength > 0) {
            $levenDist = levenshtein($message, $pattern);
            $levenSimilarity = ($maxLength - $levenDist) / $maxLength;
            $score += $levenSimilarity * 0.2;
        }

        // Kecocokan kata kunci dengan template (40%)
        $templateKeywords = explode(',', $template->keywords);
        $keywordMatches = 0;
        $totalTemplateKeywords = count($templateKeywords);
        $keywordImportance = [];

        // Identifikasi kata kunci penting
        foreach ($templateKeywords as $index => $templateKeyword) {
            $templateKeyword = trim($templateKeyword);
            // Keyword di awal list lebih penting (lebih relevan)
            $keywordImportance[$templateKeyword] = 1 + ($totalTemplateKeywords - $index) / $totalTemplateKeywords;
        }

        foreach ($keywords as $keyword) {
            foreach ($templateKeywords as $templateKeyword) {
                $templateKeyword = trim($templateKeyword);

                // Cek kecocokan partial dan pola stemming sederhana
                $keywordStem = $this->simpleStem($keyword);
                $templateStem = $this->simpleStem($templateKeyword);

                if (strpos($keywordStem, $templateStem) !== false ||
                    strpos($templateStem, $keywordStem) !== false ||
                    similar_text($keywordStem, $templateStem) / max(strlen($keywordStem), strlen($templateStem)) > 0.8) {
                    $matchValue = isset($keywordImportance[$templateKeyword]) ? $keywordImportance[$templateKeyword] : 1;
                    $keywordMatches += $matchValue;
                    break;
                }
            }
        }

        $keywordScore = count($keywords) > 0 ? min(1, $keywordMatches / (count($keywords) * 1.5)) : 0;
        $score += $keywordScore * 0.4;

        // Prioritas template (0-10) dengan pengaruh yang lebih signifikan (10%)
        $priorityBoost = $template->priority / 10 * 0.1;
        $score += $priorityBoost;

        return $score;
    }

    /**
     * Stemming sederhana untuk Bahasa Indonesia
     * Catatan: Ini hanya implementasi dasar, untuk produksi gunakan library NLP
     */
    private function simpleStem($word)
    {
        $word = strtolower(trim($word));

        // Akhiran sederhana dalam Bahasa Indonesia
        $suffixes = ['kan', 'an', 'i', 'lah', 'kah', 'nya', 'ku', 'mu'];

        // Awalan sederhana dalam Bahasa Indonesia
        $prefixes = ['me', 'pe', 'be', 'te', 'di', 'ke', 'se'];

        // Coba hapus akhiran
        foreach ($suffixes as $suffix) {
            if (strlen($word) > strlen($suffix) + 2 && substr($word, -strlen($suffix)) === $suffix) {
                $word = substr($word, 0, -strlen($suffix));
                break; // Hanya hapus satu akhiran
            }
        }

        // Coba hapus awalan
        foreach ($prefixes as $prefix) {
            if (strlen($word) > strlen($prefix) + 2 && substr($word, 0, strlen($prefix)) === $prefix) {
                $word = substr($word, strlen($prefix));
                break; // Hanya hapus satu awalan
            }
        }

        return $word;
    }
}   
