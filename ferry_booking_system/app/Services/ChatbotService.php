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
    // Konstanta untuk caching dan konfigurasi
    const CACHE_TTL_TEMPLATES = 86400; // 24 jam
    const CACHE_TTL_ANSWERS = 3600;    // 1 jam
    const CACHE_TTL_WORDS = 86400;     // 24 jam
    const MAX_CONTEXT_QUERIES = 5;     // Jumlah query yang disimpan dalam konteks
    const CONFIDENCE_THRESHOLD = 0.4;  // Threshold minimum untuk kecocokan template

    /**
     * Mendapatkan atau membuat percakapan baru
     */
    public function getOrCreateConversation($userId = null, $deviceId = null)
    {
        // Jika user login, prioritaskan mencari berdasarkan user_id
        if ($userId) {
            // SELALU cari percakapan berdasarkan user_id dulu
            $conversation = ChatConversation::where('user_id', $userId)->latest()->first();
            if ($conversation) return $conversation;

            // Jika user login tapi belum punya percakapan, BUAT BARU
            // (tidak mencoba menggunakan percakapan device_id yang mungkin dari user lain)
            return ChatConversation::create([
                'user_id' => $userId,
                'session_id' => $deviceId,
                'context' => json_encode([/* default context */])
            ]);
        }

        // Jika tidak login, baru gunakan device_id
        if ($deviceId) {
            $conversation = ChatConversation::where('session_id', $deviceId)
                ->whereNull('user_id') // Hanya ambil yang tidak terikat dengan user
                ->latest()->first();
            if ($conversation) return $conversation;
        }

        // Buat percakapan baru jika tidak ditemukan
        return ChatConversation::create([
            'user_id' => $userId,
            'session_id' => $deviceId,
            'context' => json_encode([/* default context */])
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
        ]);
    }

    /**
     * Mencari jawaban untuk pesan pengguna
     */
    public function findAnswer($message, $conversationId = null)
    {
        // Cek cache untuk jawaban yang sudah ada
        $cacheKey = 'chatbot_answer_' . md5($message . '_' . ($conversationId ?? ''));
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        Log::info('Menerima pesan: ' . $message);

        // 1. Praproses pesan
        $processedMessage = $this->preprocessMessage($message);

        // 2. Dapatkan konteks percakapan
        $context = $this->getConversationContext($conversationId);

        // 3. Update konteks dengan query terbaru
        if ($conversationId) {
            $this->updateLastQueriesContext($conversationId, $context, $processedMessage);
        }

        // 4. Deteksi apakah ini pertanyaan lanjutan
        $isFollowUpQuestion = $this->isFollowUpQuestion($processedMessage, $context);

        // 5. Tingkatkan dengan konteks jika perlu
        if ($isFollowUpQuestion && !empty($context['last_queries'])) {
            $enhancedMessage = $this->enhanceWithContext($processedMessage, $context);
            if ($enhancedMessage !== $processedMessage) {
                Log::info('Pertanyaan lanjutan dideteksi: ' . $enhancedMessage);
                $processedMessage = $enhancedMessage;
            }
        }

        // 6. Ekstrak keywords dan identifikasi intent/entity
        $keywords = $this->extractKeywords($processedMessage);
        $intentEntity = $this->identifyIntentAndEntity($processedMessage, $keywords, $context);
        $sentiment = $this->analyzeSentiment($processedMessage);

        // 7. Cari template terbaik
        $bestMatch = $this->findBestTemplate($processedMessage, $keywords, $context, $intentEntity, $isFollowUpQuestion);

        // 8. Handle jika tidak ada template yang cocok
        if (!$bestMatch) {
            $result = $this->handleNoMatchFound($processedMessage, $keywords, $context, $conversationId, $intentEntity);
            Cache::put($cacheKey, $result, self::CACHE_TTL_ANSWERS);
            return $result;
        }

        // 9. Update konteks percakapan
        if ($conversationId) {
            $this->updateConversationContext($conversationId, $context, $keywords, $bestMatch, $sentiment, $intentEntity);
        }

        // 10. Siapkan dan kembalikan jawaban
        $processedAnswer = $this->processTemplateAnswer($bestMatch->answer, $context);
        $enhancedAnswer = $this->enhanceAnswerWithRelatedInfo($processedAnswer, $bestMatch, $context);

        $result = [
            'answer' => $enhancedAnswer,
            'template_id' => $bestMatch->id,
            'confidence_score' => $bestMatch->score,
            'category_id' => $bestMatch->category_id,
            'suggested_questions' => $this->getRelatedQuestions($bestMatch->category_id, $bestMatch->id),
            'detected_entities' => $intentEntity['entity'] ? [$intentEntity['entity']] : []
        ];

        Cache::put($cacheKey, $result, self::CACHE_TTL_ANSWERS);
        return $result;
    }

    /**
     * Preprocess pesan: bersihkan teks dan koreksi typo
     */
    private function preprocessMessage($message)
    {
        // Bersihkan teks
        $text = strtolower(trim($message));
        $text = preg_replace('/\s+/', ' ', $text);
        $text = preg_replace('/[^\p{L}\p{N}\s\?\,\.\-]/u', '', $text);

        // Normalisasi singkatan umum Bahasa Indonesia
        $replacements = [
            'tdk' => 'tidak',
            'gk' => 'tidak',
            'ga' => 'tidak',
            'gak' => 'tidak',
            'dgn' => 'dengan',
            'dg' => 'dengan',
            'utk' => 'untuk',
            'u/' => 'untuk',
            'yg' => 'yang',
            'sy' => 'saya',
            'bs' => 'bisa',
            'thx' => 'terima kasih',
            'tq' => 'terima kasih',
            'gmn' => 'bagaimana',
            'skrg' => 'sekarang'
        ];

        foreach ($replacements as $find => $replace) {
            $text = preg_replace('/\b' . preg_quote($find, '/') . '\b/', $replace, $text);
        }

        // Koreksi typo dengan pendekatan efisien
        $words = explode(' ', $text);
        $corrected = [];
        $validWords = $this->getValidWords();

        foreach ($words as $word) {
            // Skip kata pendek atau sudah valid
            if (strlen($word) <= 3 || in_array($word, $validWords)) {
                $corrected[] = $word;
                continue;
            }

            // Koreksi typo
            $bestMatch = null;
            $minDistance = PHP_INT_MAX;
            $threshold = min(2, floor(strlen($word) / 4));

            foreach ($validWords as $validWord) {
                // Filter awal: hanya bandingkan kata dengan panjang serupa
                if (abs(strlen($validWord) - strlen($word)) > $threshold) {
                    continue;
                }

                $distance = levenshtein($word, $validWord);
                if ($distance < $minDistance && $distance <= $threshold) {
                    $minDistance = $distance;
                    $bestMatch = $validWord;
                }
            }

            $corrected[] = $bestMatch !== null ? $bestMatch : $word;
        }

        return implode(' ', $corrected);
    }

    /**
     * Dapatkan kata-kata valid dari cache atau database
     */
    private function getValidWords()
    {
        return Cache::remember('chatbot_valid_words', self::CACHE_TTL_WORDS, function () {
            $words = [];
            $templates = ChatTemplate::all(['keywords', 'question_pattern']);

            // Kumpulkan dari templates
            foreach ($templates as $template) {
                // Dari keywords
                $keywords = explode(',', $template->keywords);
                foreach ($keywords as $keyword) {
                    $keyword = trim($keyword);
                    if (strlen($keyword) > 3) $words[] = $keyword;
                }

                // Dari patterns
                $patternWords = explode(' ', $template->question_pattern);
                foreach ($patternWords as $word) {
                    if (strlen($word) > 3) $words[] = strtolower($word);
                }
            }

            // Tambahkan domain vocabulary
            $domainWords = [
                'tiket',
                'jadwal',
                'kapal',
                'feri',
                'kendaraan',
                'pembayaran',
                'refund',
                'reschedule',
                'booking',
                'bayar',
                'pesan',
                'kursi',
                'terminal',
                'pelabuhan',
                'bagasi',
                'promo',
                'diskon',
                'voucher',
                'transfer',
                'virtual',
                'account',
                'kartu',
                'kredit',
                'debit',
                'check-in',
                'boarding',
                'keberangkatan',
                'kedatangan'
            ];

            return array_unique(array_merge($words, $domainWords));
        });
    }

    /**
     * Ekstrak kata kunci dari pesan
     */
    private function extractKeywords($text)
    {
        // Stopwords Bahasa Indonesia
        $stopwords = [
            'yang',
            'dan',
            'di',
            'dengan',
            'ke',
            'pada',
            'untuk',
            'dari',
            'ini',
            'itu',
            'atau',
            'adalah',
            'ada',
            'jika',
            'maka',
            'saya',
            'kami',
            'kita',
            'mereka',
            'dia',
            'kamu',
            'anda',
            'bagaimana',
            'kapan',
            'dimana',
            'mengapa',
            'apa',
            'apakah',
            'ya',
            'tidak',
            'bisa',
            'boleh',
            'harus',
            'akan',
            'sudah',
            'belum'
        ];

        // Filter kata dan hapus stopwords
        $words = explode(' ', $text);
        $keywords = array_values(array_filter($words, function ($word) use ($stopwords) {
            return !in_array($word, $stopwords) && strlen($word) > 2;
        }));

        // Tambahkan frasa 2-gram dan 3-gram yang penting
        $phrases = [];
        $wordCount = count($words);

        for ($i = 0; $i < $wordCount - 1; $i++) {
            // Skip jika kedua kata adalah stopwords
            if (in_array($words[$i], $stopwords) && in_array($words[$i + 1], $stopwords)) {
                continue;
            }

            // 2-gram
            $phrases[] = $words[$i] . ' ' . $words[$i + 1];

            // 3-gram
            if ($i < $wordCount - 2 && !(in_array($words[$i], $stopwords) &&
                in_array($words[$i + 1], $stopwords) &&
                in_array($words[$i + 2], $stopwords))) {
                $phrases[] = $words[$i] . ' ' . $words[$i + 1] . ' ' . $words[$i + 2];
            }
        }

        return array_values(array_unique(array_merge($keywords, $phrases)));
    }

    /**
     * Mendeteksi apakah ini pertanyaan lanjutan
     */
    private function isFollowUpQuestion($message, $context)
    {
        if (empty($context['last_queries'])) return false;

        // Marker untuk pertanyaan lanjutan
        $followUpMarkers = [
            'bagaimana dengan',
            'yang lain',
            'selain itu',
            'tersebut',
            'itu',
            'nya',
            'lalu',
            'dan',
            'atau',
            'juga',
            'kalau',
            'misalnya',
            'berapa',
            'kapan'
        ];

        // Cek marker spesifik
        foreach ($followUpMarkers as $marker) {
            if (stripos($message, $marker) !== false) return true;
        }

        // Cek pertanyaan pendek
        $words = explode(' ', trim($message));
        if (count($words) <= 3) return true;

        // Cek keberadaan subjek dalam pertanyaan pendek
        if (count($words) <= 5) {
            $subjects = ['saya', 'anda', 'kamu', 'tiket', 'kapal', 'feri', 'pembayaran'];
            $hasSubject = false;

            foreach ($subjects as $subject) {
                if (stripos($message, $subject) !== false) {
                    $hasSubject = true;
                    break;
                }
            }

            if (!$hasSubject) return true;
        }

        return false;
    }

    /**
     * Tingkatkan pertanyaan dengan konteks dari pertanyaan sebelumnya
     */
    private function enhanceWithContext($message, $context)
    {
        if (empty($context['last_queries']) || count($context['last_queries']) < 1) {
            return $message;
        }

        $lastQuery = $context['last_queries'][0]['message'] ?? '';
        if (empty($lastQuery) || str_word_count($message) > 6) {
            return $message;
        }

        // Ekstrak entity dari pertanyaan terakhir
        $lastEntities = $this->extractEntitiesFromMessage($lastQuery);
        if (empty($lastEntities)) return $message;

        // Pola pertanyaan lanjutan
        if (preg_match('/^(bagaimana|apakah|bisakah|dapatkah|bolehkah|apa|berapa|kapan|dimana|siapa)/i', $message)) {
            foreach ($lastEntities as $entity) {
                if (stripos($message, $entity) === false) {
                    return $message . ' untuk ' . $entity;
                }
            }
        } else if (preg_match('/^(ya|tidak|ok|oke|baik)/i', $message)) {
            foreach ($lastEntities as $entity) {
                if (stripos($message, $entity) === false) {
                    return $message . ', tentang ' . $entity;
                }
            }
        } else if (preg_match('/^(dan|atau|lalu|terus|selain)/i', $message)) {
            $enhancedMessage = preg_replace('/^(dan|atau|lalu|terus|selain)\s+/i', '', $message);

            foreach ($lastEntities as $entity) {
                if (stripos($enhancedMessage, $entity) === false) {
                    return $enhancedMessage . ' ' . $entity;
                }
            }
        }

        return $message;
    }

    /**
     * Ekstrak entity dari pesan
     */
    private function extractEntitiesFromMessage($message)
    {
        $entities = [];

        // Pola entity yang dipetakan dengan kata kunci terkait
        $entityPatterns = [
            'tiket' => ['tiket', 'ticket', 'booking', 'pemesanan'],
            'jadwal' => ['jadwal', 'schedule', 'jam', 'waktu', 'keberangkatan'],
            'kapal' => ['kapal', 'feri', 'ferry', 'boat', 'ship'],
            'kendaraan' => ['kendaraan', 'mobil', 'motor', 'vehicle', 'car', 'bike'],
            'pembayaran' => ['bayar', 'payment', 'pembayaran', 'transaksi', 'transfer'],
            'terminal' => ['terminal', 'pelabuhan', 'port', 'dermaga'],
            'bagasi' => ['bagasi', 'barang', 'luggage', 'koper', 'tas'],
            'refund' => ['refund', 'batal', 'cancel', 'uang kembali', 'pengembalian'],
            'reschedule' => ['reschedule', 'ubah jadwal', 'ganti tanggal', 'pindah']
        ];

        // Cek pola entity
        foreach ($entityPatterns as $entity => $patterns) {
            foreach ($patterns as $pattern) {
                if (stripos($message, $pattern) !== false) {
                    $entities[] = $entity;
                    break;
                }
            }
        }

        // Deteksi rute spesifik
        $routePatterns = [
            'merak-bakauheni' => ['merak', 'bakauheni', 'merak-bakauheni'],
            'ketapang-gilimanuk' => ['ketapang', 'gilimanuk', 'bali', 'jawa'],
            'padangbai-lembar' => ['padangbai', 'lembar', 'lombok'],
            'batam-singapura' => ['batam', 'singapore', 'singapura']
        ];

        foreach ($routePatterns as $route => $patterns) {
            foreach ($patterns as $pattern) {
                if (stripos($message, $pattern) !== false) {
                    $entities[] = 'rute:' . $route;
                    break;
                }
            }
        }

        return array_unique($entities);
    }

    /**
     * Identifikasi intent dan entity dari pesan
     */
    private function identifyIntentAndEntity($message, $keywords, $context = [])
    {
        // Pola intent dan prioritasnya
        $intents = [
            'informasi_jadwal' => ['jadwal', 'jam', 'waktu', 'kapan', 'keberangkatan', 'kedatangan'],
            'informasi_harga' => ['harga', 'tarif', 'biaya', 'berapa', 'cost', 'price'],
            'pemesanan_tiket' => ['pesan', 'booking', 'beli', 'reservasi', 'order', 'tiket'],
            'pembayaran' => ['bayar', 'payment', 'transfer', 'e-wallet', 'va', 'virtual account'],
            'refund' => ['refund', 'batal', 'cancel', 'pengembalian', 'uang kembali'],
            'reschedule' => ['reschedule', 'ubah jadwal', 'ganti', 'pindah', 'update'],
            'check_in' => ['check-in', 'checkin', 'daftar', 'lapor', 'registrasi', 'boarding'],
            'kendaraan' => ['kendaraan', 'mobil', 'motor', 'vehicle', 'car', 'parkir'],
            'bagasi' => ['bagasi', 'barang', 'luggage', 'baggage', 'bawaan', 'koper']
        ];

        // Prioritas intent
        $intentPriority = [
            'refund' => 10,
            'reschedule' => 9,
            'pemesanan_tiket' => 8,
            'pembayaran' => 7,
            'check_in' => 6,
            'informasi_jadwal' => 5,
            'informasi_harga' => 4
        ];

        // Deteksi intent
        $detectedIntent = null;
        $intentScore = 0;

        foreach ($intents as $intent => $intentKeywords) {
            $score = 0;
            foreach ($intentKeywords as $keyword) {
                if (stripos($message, $keyword) !== false) $score++;
            }

            if ($score > 0 && ($detectedIntent === null || $score > $intentScore ||
                ($score == $intentScore &&
                    ($intentPriority[$intent] ?? 0) > ($intentPriority[$detectedIntent] ?? 0)))) {
                $detectedIntent = $intent;
                $intentScore = $score;
            }
        }

        // Deteksi entity
        $entities = $this->extractEntitiesFromMessage($message);
        $detectedEntity = !empty($entities) ? $entities[0] : null;

        // Pemetaan category berdasarkan intent/entity
        $categoryMap = [
            'informasi_umum' => 1,
            'jadwal_rute' => 2,
            'pemesanan' => 3,
            'pembayaran' => 4,
            'salam_percakapan' => 5,
            'fasilitas' => 6,
            'kendaraan_bagasi' => 7,
            'layanan_pelanggan' => 8,
            'kebijakan_peraturan' => 9,
            'faq' => 10,
            'akun_pengguna' => 11,
            'refund_reschedule' => 12,
            'layanan_tambahan' => 13,
            'check_in' => 14,
            'keamanan_data' => 15,
            'promo_diskon' => 16
        ];

        // Intent ke category
        $intentCategoryMap = [
            'informasi_jadwal' => 2,
            'informasi_harga' => 1,
            'pemesanan_tiket' => 3,
            'pembayaran' => 4,
            'refund' => 12,
            'reschedule' => 12,
            'check_in' => 14,
            'kendaraan' => 7,
            'bagasi' => 7
        ];

        // Entity ke category
        $entityCategoryMap = [
            'tiket' => 3,
            'jadwal' => 2,
            'kapal' => 1,
            'kendaraan' => 7,
            'harga' => 1,
            'pembayaran' => 4,
            'terminal' => 1,
            'bagasi' => 7,
            'refund' => 12,
            'reschedule' => 12
        ];

        // Tentukan category ID berdasarkan intent atau entity
        $categoryId = null;
        if ($detectedIntent && isset($intentCategoryMap[$detectedIntent])) {
            $categoryId = $intentCategoryMap[$detectedIntent];
        } elseif ($detectedEntity && isset($entityCategoryMap[$detectedEntity])) {
            $categoryId = $entityCategoryMap[$detectedEntity];
        }

        // Kalkulasi confidence
        $confidence = 0;
        if ($intentScore > 0 && !empty($entities)) {
            $confidence = 0.8;
        } elseif ($intentScore > 0) {
            $confidence = 0.6;
        } elseif (!empty($entities)) {
            $confidence = 0.5;
        }

        return [
            'intent' => $detectedIntent,
            'entity' => $detectedEntity,
            'confidence' => $confidence,
            'category_id' => $categoryId
        ];
    }

    /**
     * Analisis sentimen pesan
     */
    private function analyzeSentiment($message)
    {
        // Kata positif dan negatif
        $positiveWords = [
            'bagus',
            'baik',
            'senang',
            'suka',
            'puas',
            'terima kasih',
            'thanks',
            'thx',
            'hebat',
            'cepat',
            'nyaman',
            'ramah',
            'membantu',
            'mudah',
            'berhasil',
            'lancar',
            'mantap',
            'keren'
        ];

        $negativeWords = [
            'buruk',
            'jelek',
            'lambat',
            'marah',
            'kecewa',
            'kesal',
            'sulit',
            'mengesalkan',
            'tidak bisa',
            'gagal',
            'masalah',
            'problem',
            'error',
            'salah',
            'bingung',
            'lama',
            'terlambat',
            'mengecewakan'
        ];

        // Hitung skor
        $positiveScore = 0;
        $negativeScore = 0;

        foreach ($positiveWords as $word) {
            if (stripos($message, $word) !== false) $positiveScore++;
        }

        foreach ($negativeWords as $word) {
            if (stripos($message, $word) !== false) $negativeScore++;
        }

        // Tentukan sentimen
        $sentiment = 'neutral';
        if ($positiveScore > $negativeScore) {
            $sentiment = 'positive';
        } elseif ($negativeScore > $positiveScore) {
            $sentiment = 'negative';
        }

        return [
            'sentiment' => $sentiment,
            'positive_score' => $positiveScore,
            'negative_score' => $negativeScore
        ];
    }

    /**
     * Cari template terbaik berdasarkan pesan dan konteks
     */
    private function findBestTemplate($message, $keywords, $context = null, $intentEntity = null, $isFollowUpQuestion = false)
    {
        // Gunakan cache untuk hasil yang sudah ada
        $cacheKey = 'chatbot_template_' . md5($message);
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        // Ambil semua template dari cache
        $templates = Cache::remember('all_templates', self::CACHE_TTL_TEMPLATES, function () {
            return ChatTemplate::all();
        });

        $bestMatch = null;
        $highestScore = 0;

        // Bobot skor
        $contextBoost = 0.15;
        $intentBoost = 0.2;
        $followUpBoost = 0.1;

        foreach ($templates as $template) {
            // Hitung skor dasar
            $baseScore = $this->calculateMatchScore($message, $keywords, $template);

            // Tambahkan boost kontekstual
            $score = $baseScore;

            // Boost dari konteks kategori
            if (
                $context && isset($context['last_category_id']) &&
                $context['last_category_id'] == $template->category_id
            ) {
                $score += $contextBoost;
            }

            // Boost dari intent/entity
            if (
                $intentEntity && isset($intentEntity['category_id']) &&
                $intentEntity['category_id'] == $template->category_id
            ) {
                $score += $intentBoost;
            }

            // Boost pertanyaan lanjutan
            if (
                $isFollowUpQuestion && $context && isset($context['last_category_id']) &&
                $context['last_category_id'] == $template->category_id
            ) {
                $score += $followUpBoost;
            }

            // Boost dari prioritas template
            $score += ($template->priority / 10) * 0.15;

            // Update template terbaik
            if ($score > $highestScore) {
                $highestScore = $score;
                $template->score = $score;
                $bestMatch = $template;
            }
        }

        // Verifikasi threshold
        if ($highestScore < self::CONFIDENCE_THRESHOLD) {
            return null;
        }

        // Cache hasilnya
        if ($bestMatch) {
            Cache::put($cacheKey, $bestMatch, self::CACHE_TTL_ANSWERS);
        }

        return $bestMatch;
    }

    /**
     * Hitung skor kecocokan antara pesan dan template
     */
    private function calculateMatchScore($message, $keywords, $template)
    {
        // Keyword matching (60% dari skor)
        $templateKeywords = explode(',', $template->keywords);
        $keywordMatches = 0;

        foreach ($keywords as $keyword) {
            foreach ($templateKeywords as $templateKeyword) {
                $templateKeyword = trim($templateKeyword);

                // Cek kecocokan atau kesamaan
                if (
                    stripos($keyword, $templateKeyword) !== false ||
                    stripos($templateKeyword, $keyword) !== false ||
                    similar_text($keyword, $templateKeyword) / max(strlen($keyword), strlen($templateKeyword)) > 0.7
                ) {
                    $keywordMatches++;
                    break;
                }
            }
        }

        $keywordScore = count($keywords) > 0 ? min(1, $keywordMatches / count($keywords)) : 0;

        // Pattern matching (40% dari skor)
        $pattern = strtolower(trim($template->question_pattern));
        $cleanMessage = strtolower(trim($message));

        // Kecocokan sempurna
        if ($pattern === $cleanMessage) {
            return 1.0;
        }

        // Fuzzy matching dengan similar_text
        $patternSimilarity = similar_text($pattern, $cleanMessage) / max(strlen($pattern), strlen($cleanMessage));

        // Skor akhir
        return ($keywordScore * 0.6) + ($patternSimilarity * 0.4);
    }

    /**
     * Dapatkan konteks percakapan
     */
    private function getConversationContext($conversationId)
    {
        if (!$conversationId) {
            return [
                'last_category_id' => null,
                'recent_keywords' => [],
                'chat_count' => 0,
                'unanswered_count' => 0,
                'user_preferences' => [],
                'last_queries' => [],
                'detected_entities' => []
            ];
        }

        $conversation = ChatConversation::find($conversationId);
        if (!$conversation || !$conversation->context) {
            return [
                'last_category_id' => null,
                'recent_keywords' => [],
                'chat_count' => 0,
                'unanswered_count' => 0,
                'user_preferences' => [],
                'last_queries' => [],
                'detected_entities' => []
            ];
        }

        return json_decode($conversation->context, true);
    }

    /**
     * Update konteks dengan query terbaru
     */
    private function updateLastQueriesContext($conversationId, &$context, $message)
    {
        $lastQueries = $context['last_queries'] ?? [];
        array_unshift($lastQueries, [
            'message' => $message,
            'timestamp' => time()
        ]);

        $context['last_queries'] = array_slice($lastQueries, 0, self::MAX_CONTEXT_QUERIES);

        $this->saveContext($conversationId, $context);
    }

    /**
     * Update context percakapan setelah menemukan jawaban
     */
    private function updateConversationContext($conversationId, $context, $keywords, $bestMatch, $sentiment = null, $intentEntity = null)
    {
        // Update data konteks
        $context['last_category_id'] = $bestMatch->category_id;
        $context['chat_count'] = ($context['chat_count'] ?? 0) + 1;

        // Simpan keywords terbaru
        $recentKeywords = $context['recent_keywords'] ?? [];
        $recentKeywords = array_merge($recentKeywords, $keywords);
        $recentKeywords = array_unique($recentKeywords);
        $context['recent_keywords'] = array_slice($recentKeywords, 0, 15);

        // Simpan entity yang terdeteksi
        if ($intentEntity && isset($intentEntity['entity']) && $intentEntity['entity']) {
            $detectedEntities = $context['detected_entities'] ?? [];
            if (!in_array($intentEntity['entity'], $detectedEntities)) {
                $detectedEntities[] = $intentEntity['entity'];
                $context['detected_entities'] = $detectedEntities;
            }
        }

        // Update user preferences
        $userPreferences = $context['user_preferences'] ?? [];

        // Track kategori
        $categoryKey = 'category_' . $bestMatch->category_id;
        $userPreferences[$categoryKey] = ($userPreferences[$categoryKey] ?? 0) + 1;

        // Track entity
        if ($intentEntity && isset($intentEntity['entity'])) {
            $entityKey = $intentEntity['entity'] . '_interest';
            $userPreferences[$entityKey] = ($userPreferences[$entityKey] ?? 0) + 1;
        }

        // Track sentiment
        if ($sentiment) {
            $userPreferences['sentiment_history'] = $userPreferences['sentiment_history'] ?? [];
            $userPreferences['sentiment_history'][] = [
                'sentiment' => $sentiment['sentiment'],
                'timestamp' => time()
            ];

            // Batasi riwayat
            if (count($userPreferences['sentiment_history']) > 10) {
                $userPreferences['sentiment_history'] = array_slice($userPreferences['sentiment_history'], -10);
            }
        }

        $context['user_preferences'] = $userPreferences;

        // Simpan konteks
        $this->saveContext($conversationId, $context);
    }

    /**
     * Helper untuk save context
     */
    private function saveContext($conversationId, $context)
    {
        $conversation = ChatConversation::find($conversationId);
        if ($conversation) {
            $conversation->update(['context' => json_encode($context)]);
        }
    }

    /**
     * Update konteks untuk pertanyaan tanpa jawaban
     */
    private function updateContextForUnansweredQuestion($conversationId, $context)
    {
        $context['unanswered_count'] = ($context['unanswered_count'] ?? 0) + 1;

        if ($context['unanswered_count'] >= 3) {
            $context['needs_human_help'] = true;
        }

        $this->saveContext($conversationId, $context);
    }

    /**
     * Handle tidak ada template yang cocok
     */
    private function handleNoMatchFound($message, $keywords, $context, $conversationId, $intentEntity)
    {
        Log::warning('Tidak ditemukan template untuk: ' . $message);

        // Update konteks
        if ($conversationId) {
            $this->updateContextForUnansweredQuestion($conversationId, $context);
        }

        // Coba fallback dari kategori terakhir
        if (isset($context['last_category_id']) && $context['last_category_id']) {
            $fallbackResponse = $this->generateFallbackResponse($context['last_category_id']);
            if ($fallbackResponse) {
                return $fallbackResponse;
            }
        }

        // Cari jawaban alternatif
        $extractedEntities = $this->extractEntitiesFromMessage($message);

        if (!empty($extractedEntities) && $conversationId) {
            $detectedEntities = $context['detected_entities'] ?? [];
            $context['detected_entities'] = array_unique(array_merge($detectedEntities, $extractedEntities));
            $this->saveContext($conversationId, $context);
        }

        // Cari alternatif berdasarkan kata kunci
        $alternativeMatch = $this->findAlternativeMatch($keywords, $context, $extractedEntities);

        if ($alternativeMatch) {
            return [
                'answer' => $this->processTemplateAnswer($alternativeMatch->answer, $context),
                'template_id' => $alternativeMatch->id,
                'confidence_score' => 0.4,
                'category_id' => $alternativeMatch->category_id,
                'suggested_questions' => $this->getRelatedQuestions($alternativeMatch->category_id, $alternativeMatch->id),
                'is_alternative_match' => true
            ];
        }

        // Respons default dengan saran
        return [
            'answer' => 'Maaf, saya belum bisa menjawab pertanyaan tersebut dengan tepat. Silakan tanyakan hal lain terkait layanan feri kami atau hubungi customer service di 0800-123-4567.',
            'template_id' => null,
            'confidence_score' => 0,
            'suggested_questions' => $this->getSuggestedQuestions($keywords, $context, $intentEntity)
        ];
    }

    /**
     * Cari alternatif match berdasarkan keywords
     */
    private function findAlternativeMatch($keywords, $context, $entities = [])
    {
        if (empty($keywords) && empty($entities)) {
            return null;
        }

        $templateIds = [];

        // Cari berdasarkan entity
        if (!empty($entities)) {
            foreach ($entities as $entity) {
                $entityKeywords = $this->getKeywordsForEntity($entity);

                foreach ($entityKeywords as $keyword) {
                    $matches = ChatTemplate::whereRaw('LOWER(keywords) LIKE ?', ['%' . strtolower($keyword) . '%'])
                        ->orderBy('priority', 'desc')
                        ->take(3)
                        ->pluck('id')
                        ->toArray();

                    $templateIds = array_merge($templateIds, $matches);
                }
            }
        }

        // Tambahkan dari keywords
        if (count($templateIds) < 5 && !empty($keywords)) {
            $keywordsToCheck = array_slice($keywords, 0, 3);

            foreach ($keywordsToCheck as $keyword) {
                $matches = ChatTemplate::whereRaw('LOWER(keywords) LIKE ?', ['%' . strtolower($keyword) . '%'])
                    ->orderBy('priority', 'desc')
                    ->take(3)
                    ->pluck('id')
                    ->toArray();

                $templateIds = array_merge($templateIds, $matches);
            }
        }

        $templateIds = array_unique($templateIds);

        if (empty($templateIds)) {
            return null;
        }

        // Prioritaskan dari kategori sebelumnya
        if (!empty($context['last_category_id'])) {
            $template = ChatTemplate::whereIn('id', $templateIds)
                ->where('category_id', $context['last_category_id'])
                ->orderBy('priority', 'desc')
                ->first();

            if ($template) {
                return $template;
            }
        }

        // Ambil template dengan prioritas tertinggi
        return ChatTemplate::whereIn('id', $templateIds)
            ->orderBy('priority', 'desc')
            ->first();
    }

    /**
     * Get keywords untuk entity
     */
    private function getKeywordsForEntity($entity)
    {
        // Mapping entity ke keywords
        $entityKeywordsMap = [
            'tiket' => ['tiket', 'ticket', 'booking', 'pemesanan'],
            'jadwal' => ['jadwal', 'schedule', 'keberangkatan'],
            'pembayaran' => ['bayar', 'payment', 'pembayaran', 'metode'],
            'kendaraan' => ['kendaraan', 'mobil', 'motor', 'vehicle'],
            'rute:merak-bakauheni' => ['merak', 'bakauheni', 'selat sunda'],
            'rute:ketapang-gilimanuk' => ['ketapang', 'gilimanuk', 'bali'],
            'rute:padangbai-lembar' => ['padangbai', 'lembar', 'lombok'],
            'rute:batam-singapura' => ['batam', 'singapura', 'singapore']
        ];

        // Handle entity rute
        if (strpos($entity, 'rute:') === 0) {
            $routeName = substr($entity, 5);
            return $entityKeywordsMap['rute:' . $routeName] ?? [$routeName];
        }

        return $entityKeywordsMap[$entity] ?? [$entity];
    }

    /**
     * Generate fallback response berdasarkan kategori
     */
    private function generateFallbackResponse($categoryId)
    {
        $category = ChatCategory::find($categoryId);
        if (!$category) {
            return null;
        }

        return [
            'answer' => "Maaf, saya belum dapat menjawab secara spesifik tentang pertanyaan Anda mengenai {$category->name}. Tapi saya dapat membantu Anda dengan pertanyaan lain terkait kategori ini.",
            'template_id' => null,
            'confidence_score' => 0.1,
            'category_id' => $categoryId,
            'suggested_questions' => $this->getQuestionsFromCategory($categoryId)
        ];
    }

    /**
     * Dapatkan pertanyaan dari kategori
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
     * Dapatkan pertanyaan terkait berdasarkan kategori
     */
    private function getRelatedQuestions($categoryId, $excludeTemplateId)
    {
        $templates = ChatTemplate::where('category_id', $categoryId)
            ->where('id', '!=', $excludeTemplateId)
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
     * Memberikan saran pertanyaan cerdas
     */
    private function getSuggestedQuestions($keywords, $context, $intentEntity)
    {
        $suggestions = [];
        $entitySuggestions = [];
        $intentSuggestions = [];

        // Berdasarkan entity
        if (!empty($intentEntity['entity'])) {
            $entity = $intentEntity['entity'];
            $entitySuggestions = $this->getSuggestionsForEntity($entity);
        }

        // Berdasarkan intent
        if (!empty($intentEntity['intent'])) {
            $intent = $intentEntity['intent'];
            $intentSuggestions = $this->getSuggestionsForIntent($intent);
        }

        // Gabungkan saran
        $suggestions = array_merge($entitySuggestions, $intentSuggestions);

        // Jika masih kurang, tambahkan dari keywords
        if (count($suggestions) < 3 && !empty($keywords)) {
            $keywordSuggestions = $this->getSuggestionsFromKeywords($keywords, $suggestions);
            $suggestions = array_merge($suggestions, $keywordSuggestions);
        }

        // Jika masih kurang, tambahkan dari pertanyaan populer
        if (count($suggestions) < 3) {
            $popularQuestions = [
                'Bagaimana cara memesan tiket feri?',
                'Apa saja metode pembayaran yang tersedia?',
                'Berapa batas waktu check-in?',
                'Bagaimana jika saya ingin membawa kendaraan?',
                'Apakah ada promo untuk perjalanan saat ini?'
            ];

            foreach ($popularQuestions as $question) {
                if (count($suggestions) >= 3) break;

                $isDuplicate = false;
                foreach ($suggestions as $existing) {
                    if ($existing['question'] === $question) {
                        $isDuplicate = true;
                        break;
                    }
                }

                if (!$isDuplicate) {
                    $suggestions[] = [
                        'id' => null,
                        'question' => $question
                    ];
                }
            }
        }

        return array_slice($suggestions, 0, 3);
    }

    /**
     * Dapatkan saran berdasarkan entity
     */
    private function getSuggestionsForEntity($entity)
    {
        $suggestions = [];

        $entitySuggestions = [
            'tiket' => [
                'Bagaimana cara memesan tiket?',
                'Berapa harga tiket untuk rute populer?'
            ],
            'jadwal' => [
                'Apa saja jadwal keberangkatan hari ini?',
                'Jadwal feri rute Merak-Bakauheni'
            ],
            'pembayaran' => [
                'Metode pembayaran apa saja yang tersedia?',
                'Bagaimana cara melakukan pembayaran?'
            ],
            'kendaraan' => [
                'Berapa biaya tambahan untuk membawa kendaraan?',
                'Bagaimana prosedur check-in kendaraan?'
            ]
        ];

        if (isset($entitySuggestions[$entity])) {
            foreach ($entitySuggestions[$entity] as $question) {
                $suggestions[] = [
                    'id' => null,
                    'question' => $question
                ];
            }
        } else {
            // Cari template berdasarkan entity keyword
            $templates = ChatTemplate::whereRaw('LOWER(keywords) LIKE ?', ['%' . strtolower($entity) . '%'])
                ->orderBy('priority', 'desc')
                ->take(2)
                ->get(['id', 'question_pattern']);

            foreach ($templates as $template) {
                $suggestions[] = [
                    'id' => $template->id,
                    'question' => $template->question_pattern
                ];
            }
        }

        return $suggestions;
    }

    /**
     * Dapatkan saran berdasarkan intent
     */
    private function getSuggestionsForIntent($intent)
    {
        $suggestions = [];

        $intentSuggestions = [
            'informasi_jadwal' => ['Apa saja jadwal keberangkatan hari ini?'],
            'pemesanan_tiket' => ['Bagaimana cara memesan tiket?'],
            'pembayaran' => ['Metode pembayaran apa saja yang tersedia?'],
            'refund' => ['Bagaimana cara refund tiket?'],
            'reschedule' => ['Bagaimana cara mengubah jadwal perjalanan?']
        ];

        if (isset($intentSuggestions[$intent])) {
            foreach ($intentSuggestions[$intent] as $question) {
                $suggestions[] = [
                    'id' => null,
                    'question' => $question
                ];
            }
        }

        return $suggestions;
    }

    /**
     * Dapatkan saran dari keywords
     */
    private function getSuggestionsFromKeywords($keywords, $existingSuggestions)
    {
        $suggestions = [];
        $keywordsToCheck = array_slice($keywords, 0, 3);

        foreach ($keywordsToCheck as $keyword) {
            $templates = ChatTemplate::whereRaw('LOWER(keywords) LIKE ?', ['%' . strtolower($keyword) . '%'])
                ->orderBy('priority', 'desc')
                ->take(2)
                ->get(['id', 'question_pattern']);

            foreach ($templates as $template) {
                $isDuplicate = false;
                foreach ($existingSuggestions as $existing) {
                    if (isset($existing['id']) && $existing['id'] == $template->id) {
                        $isDuplicate = true;
                        break;
                    }
                }

                if (!$isDuplicate) {
                    $suggestions[] = [
                        'id' => $template->id,
                        'question' => $template->question_pattern
                    ];
                }

                if (count($suggestions) >= (3 - count($existingSuggestions))) {
                    break 2;
                }
            }
        }

        return $suggestions;
    }

    /**
     * Proses jawaban template dengan personalisasi
     */
    private function processTemplateAnswer($answer, $context)
    {
        // Ganti placeholder dalam template
        $processedAnswer = $answer;

        // Ganti {user_name} jika ada
        if (isset($context['user_name']) && $context['user_name']) {
            $processedAnswer = str_replace('{user_name}', $context['user_name'], $processedAnswer);
        }

        // Ganti placeholder lain jika ada
        if (isset($context['last_search']) && $context['last_search']) {
            $processedAnswer = str_replace('{last_search}', $context['last_search'], $processedAnswer);
        }

        return $processedAnswer;
    }

    /**
     * Tingkatkan jawaban dengan informasi terkait dari konteks
     */
    private function enhanceAnswerWithRelatedInfo($answer, $template, $context)
    {
        // Tambahkan informasi cuaca untuk jadwal
        if ($template->category_id == 2 && strpos($answer, 'jadwal') !== false) {
            if (isset($context['detected_entities']) && in_array('rute:merak-bakauheni', $context['detected_entities'])) {
                $answer .= "\n\nInfo tambahan: Rute Merak-Bakauheni saat ini beroperasi normal. Prakiraan cuaca menunjukkan kondisi baik untuk pelayaran.";
            }
        }

        // Tambahkan informasi promo jika relevan
        if (
            $template->category_id == 4 && isset($context['user_preferences']['category_16']) &&
            $context['user_preferences']['category_16'] > 0
        ) {
            if (strpos($answer, 'promo') === false && strpos($answer, 'diskon') === false) {
                $answer .= "\n\nKami juga memiliki beberapa promo pembayaran yang mungkin menarik untuk Anda. Anda dapat melihatnya di menu 'Promo' pada aplikasi.";
            }
        }

        // Informasi kendaraan untuk rute populer
        if ($template->category_id == 2 && strpos($answer, 'rute populer') !== false) {
            if (
                isset($context['user_preferences']['kendaraan_interest']) &&
                $context['user_preferences']['kendaraan_interest'] > 0
            ) {
                $answer .= "\n\nPerlu diketahui bahwa semua rute tersebut memiliki fasilitas angkutan kendaraan bermotor.";
            }
        }

        return $answer;
    }
}
