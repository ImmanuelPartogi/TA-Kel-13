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
    // Pemetaan ID kategori untuk referensi
    private $categoryMap = [
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
        'promo_diskon' => 16,
        'tips_perjalanan' => 17,
        'kebutuhan_khusus' => 18
    ];

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
                'unanswered_count' => 0,
                'user_preferences' => [],
                'last_queries' => [],
                'conversation_flow' => [], // Untuk pelacakan alur percakapan
                'detected_entities' => [] // Untuk menyimpan entity yang terdeteksi
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

        // Koreksi kesalahan ketik sederhana
        $correctedMessage = $this->correctTypos($cleanedMessage);
        if ($correctedMessage !== $cleanedMessage) {
            Log::info('Pesan dikoreksi dari: "' . $cleanedMessage . '" menjadi: "' . $correctedMessage . '"');
            $cleanedMessage = $correctedMessage;
        }

        // Ekstrak kata kunci dari pesan
        $keywords = $this->extractKeywords($cleanedMessage);

        // Dapatkan konteks percakapan jika ada
        $context = $this->getConversationContext($conversationId);

        // Update last queries dalam konteks
        if ($conversationId) {
            $this->updateLastQueriesContext($conversationId, $context, $cleanedMessage);
        }

        // Analisis sentimen yang lebih baik
        $sentiment = $this->analyzeEnhancedSentiment($cleanedMessage);

        // Identifikasi intent dan entity dari pertanyaan user
        $intentEntity = $this->identifyIntentAndEntityEnhanced($cleanedMessage, $keywords, $context);

        // Deteksi jenis pertanyaan (informasi, aksi, konfirmasi, dll)
        $questionType = $this->detectQuestionType($cleanedMessage);

        // Deteksi apakah ini pertanyaan lanjutan yang memerlukan konteks sebelumnya
        $isFollowUpQuestion = $this->isFollowUpQuestion($cleanedMessage, $context);

        // Jika ini pertanyaan lanjutan, gabungkan dengan konteks sebelumnya
        if ($isFollowUpQuestion && !empty($context['last_queries'])) {
            $enhancedMessage = $this->enhanceWithContext($cleanedMessage, $context);
            if ($enhancedMessage !== $cleanedMessage) {
                Log::info('Pertanyaan lanjutan dideteksi. Pesan ditingkatkan dengan konteks: ' . $enhancedMessage);
                $cleanedMessage = $enhancedMessage;
                // Update keywords dengan pesan yang ditingkatkan
                $additionalKeywords = $this->extractKeywords($enhancedMessage);
                $keywords = array_merge($keywords, $additionalKeywords);
                $keywords = array_unique($keywords);
            }
        }

        // Coba deteksi multiple intents dalam satu pertanyaan
        $multipleIntents = $this->detectMultipleIntents($cleanedMessage);

        // Jika terdapat multiple intents, pilih yang paling relevan atau prioritas tertinggi
        if (count($multipleIntents) > 1) {
            Log::info('Multiple intents terdeteksi: ' . implode(', ', array_column($multipleIntents, 'intent')));
            // Prioritaskan intent berdasarkan skor confidence
            usort($multipleIntents, function ($a, $b) {
                return $b['confidence'] <=> $a['confidence'];
            });
            $intentEntity = $multipleIntents[0]; // Ambil intent dengan confidence tertinggi
        }

        // Cari template yang cocok dengan memperhatikan semua faktor di atas
        $bestMatch = $this->findBestTemplate($cleanedMessage, $keywords, $context, $intentEntity, $questionType, $isFollowUpQuestion);

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

            // Coba ekstrak entity yang mungkin relevan untuk pencarian alternatif
            $extractedEntities = $this->extractEntitiesFromMessage($cleanedMessage);
            if (!empty($extractedEntities)) {
                // Update konteks dengan entity baru
                $detectedEntities = $context['detected_entities'] ?? [];
                $context['detected_entities'] = array_unique(array_merge($detectedEntities, $extractedEntities));

                if ($conversationId) {
                    $conversation = ChatConversation::find($conversationId);
                    if ($conversation) {
                        $conversation->update(['context' => json_encode($context)]);
                    }
                }
            }

            // Jika tidak ada fallback berdasarkan kategori, coba cari alternatif berdasarkan kata kunci
            $alternativeMatch = $this->findAlternativeMatch($keywords, $context, $extractedEntities ?? []);
            if ($alternativeMatch) {
                return [
                    'answer' => $this->processTemplateAnswer($alternativeMatch->answer, $context),
                    'template_id' => $alternativeMatch->id,
                    'confidence_score' => 0.4, // Skor rendah karena ini alternatif
                    'category_id' => $alternativeMatch->category_id,
                    'suggested_questions' => $this->getRelatedQuestions($alternativeMatch->category_id, $alternativeMatch->id),
                    'is_alternative_match' => true
                ];
            }

            // Jika semua metode gagal, berikan respons default dengan saran yang lebih relevan
            return [
                'answer' => 'Maaf, saya belum bisa menjawab pertanyaan tersebut dengan tepat. Silakan tanyakan hal lain terkait layanan feri kami atau hubungi customer service di 0800-123-4567.',
                'template_id' => null,
                'confidence_score' => 0,
                'suggested_questions' => $this->getSmartSuggestedQuestions($keywords, $context, $intentEntity)
            ];
        }

        Log::info('Template yang cocok ditemukan: ' . $bestMatch->question_pattern . ' (score: ' . $bestMatch->score . ')');

        // Update konteks percakapan
        if ($conversationId) {
            $this->updateConversationContext($conversationId, $context, $keywords, $bestMatch, $sentiment, $intentEntity);
        }

        // Proses jawaban dengan personalisasi yang lebih baik
        $processedAnswer = $this->processTemplateAnswer($bestMatch->answer, $context);

        // Tambahkan informasi terkait jika relevan
        $enhancedAnswer = $this->enhanceAnswerWithRelatedInfo($processedAnswer, $bestMatch, $context);

        return [
            'answer' => $enhancedAnswer,
            'template_id' => $bestMatch->id,
            'confidence_score' => $bestMatch->score,
            'category_id' => $bestMatch->category_id,
            'suggested_questions' => $this->getRelatedQuestions($bestMatch->category_id, $bestMatch->id),
            'detected_entities' => $intentEntity['entity'] ? [$intentEntity['entity']] : []
        ];
    }

    /**
     * Koreksi kesalahan ketik sederhana berdasarkan kedekatan keyboard dan pola umum kesalahan ketik Bahasa Indonesia
     */
    private function correctTypos($text)
    {
        // Pemetaan kesalahan ketik umum dalam Bahasa Indonesia
        $commonTypos = [
            'tioket' => 'tiket',
            'tikket' => 'tiket',
            'tiket' => 'tiket',
            'jadwal' => 'jadwal',
            'jadual' => 'jadwal',
            'feery' => 'feri',
            'fery' => 'feri',
            'ferri' => 'feri',
            'refund' => 'refund',
            'refun' => 'refund',
            'bagaimama' => 'bagaimana',
            'bagaimanna' => 'bagaimana',
            'bagaimna' => 'bagaimana',
            'bgaimana' => 'bagaimana',
            'kendaraaan' => 'kendaraan',
            'kendaran' => 'kendaraan',
            'bayaar' => 'bayar',
            'bayarr' => 'bayar',
            'pembayaraan' => 'pembayaran',
            'pembayran' => 'pembayaran',
            'trnsfer' => 'transfer',
            'brangkat' => 'berangkat',
            'berngkat' => 'berangkat',
            'trminal' => 'terminal',
            'termnal' => 'terminal',
            'peljaran' => 'pelayaran',
            'plabuhan' => 'pelabuhan',
            'pelabuhn' => 'pelabuhan'
        ];

        $words = explode(' ', $text);
        $corrected = [];

        foreach ($words as $word) {
            $lowerWord = strtolower($word);

            // Koreksi dari daftar kesalahan ketik umum
            if (isset($commonTypos[$lowerWord])) {
                $corrected[] = $commonTypos[$lowerWord];
                continue;
            }

            // Jika kata pendek atau tidak perlu dikoreksi
            if (strlen($word) <= 3) {
                $corrected[] = $word;
                continue;
            }

            // Koreksi berdasarkan jarak Levenshtein (koreksi sederhana)
            $bestMatch = null;
            $minDistance = PHP_INT_MAX;

            // Bandingkan dengan daftar kata-kata yang valid (dari keywords template)
            $validWords = $this->getValidWordsFromTemplates();

            foreach ($validWords as $validWord) {
                $distance = levenshtein($lowerWord, $validWord);

                // Hanya koreksi jika jaraknya cukup dekat (berdasarkan panjang kata)
                $threshold = min(3, floor(strlen($validWord) / 3));

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
     * Mendapatkan daftar kata valid dari template untuk koreksi typo
     */
    private function getValidWordsFromTemplates()
    {
        // Kunci cache untuk mengoptimalkan performa
        $cacheKey = 'chatbot_valid_words';

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $validWords = [];

        // Kumpulkan keywords dari semua template
        $templates = ChatTemplate::all(['keywords', 'question_pattern']);

        foreach ($templates as $template) {
            // Tambahkan dari keywords
            $keywords = explode(',', $template->keywords);
            foreach ($keywords as $keyword) {
                $keyword = trim(strtolower($keyword));
                if (strlen($keyword) > 3) { // Abaikan kata pendek
                    $validWords[] = $keyword;
                }
            }

            // Tambahkan dari question_pattern
            $patternWords = explode(' ', strtolower($template->question_pattern));
            foreach ($patternWords as $word) {
                if (strlen($word) > 3) { // Abaikan kata pendek
                    $validWords[] = $word;
                }
            }
        }

        // Tambahkan kosakata domain-specific
        $domainVocabulary = [
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
            'kedatangan',
            'jam',
            'tanggal',
            'harga'
        ];

        $validWords = array_merge($validWords, $domainVocabulary);
        $validWords = array_unique($validWords);

        // Simpan ke cache selama 24 jam
        Cache::put($cacheKey, $validWords, 86400);

        return $validWords;
    }

    /**
     * Mendeteksi apakah ini adalah pertanyaan lanjutan yang memerlukan konteks sebelumnya
     */
    private function isFollowUpQuestion($message, $context)
    {
        if (empty($context['last_queries'])) {
            return false;
        }

        // Marker untuk pertanyaan lanjutan
        $followUpMarkers = [
            'bagaimana dengan',
            'yang lain',
            'selain itu',
            'selanjutnya',
            'terus',
            'kemudian',
            'tadi',
            'tersebut',
            'itu',
            'nya',
            'lalu',
            'dan',
            'atau',
            'juga',
            'bagaimana jika',
            'kalau',
            'misalnya',
            'contohnya',
            'berapa',
            'kapan',
            'dimana',
            'siapa',
            'kalo',
            'lainnya'
        ];

        // Marker untuk pertanyaan pendek yang mungkin lanjutan
        $shortQuestionMarkers = ['ya', 'tidak', 'oke', 'ok', 'baik', 'bagus', 'benar', 'salah'];

        // Cek apakah ada marker pertanyaan lanjutan
        foreach ($followUpMarkers as $marker) {
            if (stripos($message, $marker) !== false) {
                return true;
            }
        }

        // Cek apakah ini pertanyaan pendek (potensial lanjutan)
        $words = explode(' ', trim($message));
        if (count($words) <= 3) {
            foreach ($shortQuestionMarkers as $marker) {
                if (in_array(strtolower($words[0]), $shortQuestionMarkers)) {
                    return true;
                }
            }
        }

        // Cek apakah ini pertanyaan tanpa subjek yang jelas (missing referent)
        $hasSubject = false;
        $subjectMarkers = ['saya', 'anda', 'kamu', 'mereka', 'dia', 'kita', 'kami', 'tiket', 'kapal', 'feri', 'pembayaran'];

        foreach ($subjectMarkers as $subject) {
            if (stripos($message, $subject) !== false) {
                $hasSubject = true;
                break;
            }
        }

        // Jika tidak ada subjek yang jelas dan pertanyaan pendek, kemungkinan ini lanjutan
        if (!$hasSubject && count($words) <= 5) {
            return true;
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

        // Jika tidak ada pertanyaan terakhir, kembalikan pesan asli
        if (empty($lastQuery)) {
            return $message;
        }

        // Jika pertanyaan saat ini sudah cukup panjang, mungkin sudah self-contained
        if (str_word_count($message) > 6) {
            return $message;
        }

        // Ekstrak entity dari pertanyaan terakhir
        $lastEntities = $this->extractEntitiesFromMessage($lastQuery);

        // Jika dalam pertanyaan terakhir ditemukan entity yang tidak ada di pertanyaan saat ini
        foreach ($lastEntities as $entity) {
            if (stripos($message, $entity) === false) {
                // Coba cari kemungkinan pola pertanyaan lanjutan dan tambahkan konteks yang relevan
                if (preg_match('/^(bagaimana|apakah|bisakah|dapatkah|bolehkah|apa|berapa|kapan|dimana|siapa)/i', $message)) {
                    return $message . ' untuk ' . $entity;
                } elseif (preg_match('/^(ya|tidak|ok|oke|baik)/i', $message)) {
                    return $message . ', tentang ' . $entity;
                }
            }
        }

        // Jika tidak ada pola khusus yang cocok, gabungkan dengan cara umum
        if (preg_match('/^(dan|atau|lalu|terus|selain)/i', $message)) {
            // Contoh: "dan bagaimana dengan biayanya?" -> "bagaimana dengan biaya [entity]?"
            $enhancedMessage = preg_replace('/^(dan|atau|lalu|terus|selain)\s+/i', '', $message);

            // Tambahkan entity terakhir jika tidak ada di pesan saat ini
            foreach ($lastEntities as $entity) {
                if (stripos($enhancedMessage, $entity) === false) {
                    $enhancedMessage .= ' ' . $entity;
                }
            }

            return $enhancedMessage;
        }

        return $message;
    }

    /**
     * Ekstrak entity dari pesan untuk pelacakan konteks
     */
    private function extractEntitiesFromMessage($message)
    {
        $entities = [];

        // Daftar entity yang umum dalam domain feri
        $entityPatterns = [
            'tiket' => ['tiket', 'ticket', 'booking', 'pemesanan'],
            'jadwal' => ['jadwal', 'schedule', 'jam', 'waktu', 'keberangkatan', 'kedatangan'],
            'kapal' => ['kapal', 'feri', 'ferry', 'boat', 'ship'],
            'kendaraan' => ['kendaraan', 'mobil', 'motor', 'vehicle', 'car', 'bike'],
            'pembayaran' => ['bayar', 'payment', 'pembayaran', 'transaksi', 'transfer', 'kartu'],
            'terminal' => ['terminal', 'pelabuhan', 'port', 'dermaga'],
            'bagasi' => ['bagasi', 'barang', 'luggage', 'koper', 'tas'],
            'refund' => ['refund', 'batal', 'cancel', 'uang kembali', 'pengembalian'],
            'reschedule' => ['reschedule', 'ubah jadwal', 'ganti tanggal', 'pindah']
        ];

        foreach ($entityPatterns as $entity => $patterns) {
            foreach ($patterns as $pattern) {
                if (stripos($message, $pattern) !== false) {
                    $entities[] = $entity;
                    break; // Sekali entity terdeteksi, tidak perlu cek pattern lain
                }
            }
        }

        // Coba ekstrak entity khusus (mis. nama rute, kota, dll)
        $routePatterns = [
            'merak-bakauheni' => ['merak', 'bakauheni', 'merak-bakauheni', 'merak bakauheni'],
            'ketapang-gilimanuk' => ['ketapang', 'gilimanuk', 'ketapang-gilimanuk', 'bali', 'jawa'],
            'padangbai-lembar' => ['padangbai', 'lembar', 'padang bai', 'lombok'],
            'batam-singapura' => ['batam', 'singapore', 'singapura', 'batam-singapore']
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
     * Deteksi multiple intents dalam satu pertanyaan
     */
    private function detectMultipleIntents($message)
    {
        $intents = [];

        // Split messages by potential intent separators
        $segments = preg_split('/(dan|juga|serta|selain itu|kemudian|lalu|selanjutnya|sekalian|bisa|tolong|atau)/i', $message, -1, PREG_SPLIT_NO_EMPTY);

        if (count($segments) <= 1) {
            // Tidak ada multiple intents yang terdeteksi
            return [$this->identifyIntentAndEntityEnhanced($message, $this->extractKeywords($message), [])];
        }

        // Process each segment to identify intent
        foreach ($segments as $segment) {
            $segment = trim($segment);
            if (empty($segment)) continue;

            $keywords = $this->extractKeywords($segment);
            $intentEntity = $this->identifyIntentAndEntityEnhanced($segment, $keywords, []);

            if ($intentEntity['intent']) {
                $intents[] = $intentEntity;
            }
        }

        return $intents;
    }

    /**
     * Tingkatkan jawaban dengan informasi terkait jika relevan
     */
    private function enhanceAnswerWithRelatedInfo($answer, $template, $context)
    {
        // Jika ini pertanyaan tentang jadwal, tambahkan info cuaca jika ada dalam konteks
        if ($template->category_id == 2 && strpos($answer, 'jadwal') !== false) {
            if (isset($context['detected_entities']) && in_array('rute:merak-bakauheni', $context['detected_entities'])) {
                $answer .= "\n\nInfo tambahan: Rute Merak-Bakauheni saat ini beroperasi normal. Prakiraan cuaca menunjukkan kondisi baik untuk pelayaran.";
            }
        }

        // Jika pertanyaan tentang pembayaran dan user pernah bertanya tentang promo
        if ($template->category_id == 4 && isset($context['user_preferences']['category_16']) && $context['user_preferences']['category_16'] > 0) {
            if (strpos($answer, 'promo') === false && strpos($answer, 'diskon') === false) {
                $answer .= "\n\nKami juga memiliki beberapa promo pembayaran yang mungkin menarik untuk Anda. Anda dapat melihatnya di menu 'Promo' pada aplikasi.";
            }
        }

        // Jika user bertanya tentang jadwal rute tanpa spesifik
        if ($template->category_id == 2 && strpos($answer, 'rute populer') !== false) {
            // Cek apakah user pernah bertanya tentang kendaraan sebelumnya
            if (isset($context['user_preferences']['vehicle_interest']) && $context['user_preferences']['vehicle_interest'] > 0) {
                $answer .= "\n\nPerlu diketahui bahwa semua rute tersebut memiliki fasilitas angkutan kendaraan bermotor.";
            }
        }

        return $answer;
    }

    /**
     * Analisis sentimen yang lebih baik dengan deteksi emosi
     */
    private function analyzeEnhancedSentiment($message)
    {
        // Kata positif yang lebih komprehensif
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
            'keren',
            'recommended',
            'rekomended',
            'oke',
            'ok',
            'jos',
            'mantul',
            'gampang',
            'memuaskan',
            'sukses',
            'tepat waktu',
            'responsif',
            'profesional'
        ];

        // Kata negatif yang lebih komprehensif
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
            'mengecewakan',
            'menunggu',
            'rugi',
            'rusak',
            'payah',
            'mahal',
            'tidak jelas',
            'tidak berfungsi',
            'batal',
            'cancel',
            'tidak puas',
            'komplain'
        ];

        // Emosi yang lebih spesifik
        $emotions = [
            'senang' => ['senang', 'gembira', 'bahagia', 'suka', 'antusias', 'excited'],
            'marah' => ['marah', 'kesal', 'jengkel', 'emosi', 'frustasi', 'geram'],
            'sedih' => ['sedih', 'kecewa', 'murung', 'menyesal', 'merana'],
            'takut' => ['takut', 'khawatir', 'cemas', 'bingung', 'ragu', 'tidak yakin'],
            'terkejut' => ['terkejut', 'kaget', 'wow', 'tidak percaya', 'serius?'],
            'bingung' => ['bingung', 'tidak mengerti', 'tidak paham', 'gimana', 'bagaimana']
        ];

        // Hitung skor sentimen dan emosi
        $positiveScore = 0;
        $negativeScore = 0;
        $emotionScores = array_fill_keys(array_keys($emotions), 0);

        // Analisis sentimen dasar
        foreach ($positiveWords as $word) {
            if (stripos($message, $word) !== false) {
                $positiveScore++;
            }
        }

        foreach ($negativeWords as $word) {
            if (stripos($message, $word) !== false) {
                $negativeScore++;
            }
        }

        // Analisis emosi
        foreach ($emotions as $emotion => $emotionWords) {
            foreach ($emotionWords as $word) {
                if (stripos($message, $word) !== false) {
                    $emotionScores[$emotion]++;
                }
            }
        }

        // Tentukan sentimen utama
        $sentiment = 'neutral';
        if ($positiveScore > $negativeScore) {
            $sentiment = 'positive';
        } elseif ($negativeScore > $positiveScore) {
            $sentiment = 'negative';
        }

        // Tentukan emosi dominan
        $dominantEmotion = null;
        $maxEmotionScore = 0;
        foreach ($emotionScores as $emotion => $score) {
            if ($score > $maxEmotionScore) {
                $maxEmotionScore = $score;
                $dominantEmotion = $emotion;
            }
        }

        return [
            'sentiment' => $sentiment,
            'positive_score' => $positiveScore,
            'negative_score' => $negativeScore,
            'emotion' => $maxEmotionScore > 0 ? $dominantEmotion : null,
            'emotion_confidence' => $maxEmotionScore
        ];
    }

    /**
     * Identifikasi intent dan entity yang ditingkatkan dengan analisis kontekstual
     */
    private function identifyIntentAndEntityEnhanced($message, $keywords, $context = [])
    {
        // Daftar intent yang lebih terperinci dan domain-specific
        $intents = [
            'informasi_jadwal' => ['jadwal', 'jam', 'waktu', 'kapan', 'departure', 'keberangkatan', 'kedatangan'],
            'informasi_harga' => ['harga', 'tarif', 'biaya', 'berapa', 'cost', 'price', 'tariff'],
            'pemesanan_tiket' => ['pesan', 'booking', 'beli', 'reservasi', 'order', 'tiket', 'pembelian'],
            'pembayaran' => ['bayar', 'payment', 'transfer', 'e-wallet', 'va', 'virtual account', 'atm'],
            'refund' => ['refund', 'batal', 'cancel', 'pengembalian', 'uang kembali', 'membatalkan'],
            'reschedule' => ['reschedule', 'ubah jadwal', 'ganti', 'pindah', 'modifikasi', 'perbarui', 'update'],
            'informasi_fasilitas' => ['fasilitas', 'facility', 'tersedia', 'ada', 'fitur', 'pelayanan'],
            'check_in' => ['check-in', 'checkin', 'daftar', 'lapor', 'registrasi', 'boarding'],
            'kendaraan' => ['kendaraan', 'mobil', 'motor', 'vehicle', 'car', 'bike', 'parkir'],
            'bagasi' => ['bagasi', 'barang', 'luggage', 'baggage', 'bawaan', 'koper', 'tas'],
            'bantuan' => ['bantuan', 'bantu', 'tolong', 'help', 'support', 'assistance', 'layanan'],
            'keluhan' => ['komplain', 'keluhan', 'masalah', 'problem', 'issue', 'tidak bisa', 'kendala'],
            'konfirmasi_status' => ['status', 'konfirmasi', 'memastikan', 'cek', 'verify', 'confirmation'],
            'informasi_promo' => ['promo', 'diskon', 'discount', 'voucher', 'kupon', 'hemat', 'potongan', 'offer'],
            'informasi_akun' => ['akun', 'account', 'profil', 'login', 'daftar', 'register', 'password']
        ];

        // Daftar entity yang lebih lengkap
        $entities = [
            'tiket' => ['tiket', 'ticket', 'boarding pass', 'e-ticket', 'booking'],
            'jadwal' => ['jadwal', 'schedule', 'waktu', 'jam', 'tanggal', 'hari', 'departure'],
            'kapal' => ['kapal', 'ferry', 'boat', 'ship', 'feri', 'vessel'],
            'kendaraan' => ['kendaraan', 'mobil', 'motor', 'vehicle', 'car', 'bike', 'sepeda', 'truk'],
            'harga' => ['harga', 'tarif', 'biaya', 'price', 'cost', 'ongkos', 'fee', 'charge'],
            'akun' => ['akun', 'account', 'profil', 'profile', 'login', 'daftar', 'password'],
            'bagasi' => ['bagasi', 'barang', 'luggage', 'baggage', 'bawaan', 'koper', 'tas'],
            'terminal' => ['terminal', 'pelabuhan', 'port', 'dermaga', 'dock', 'pier', 'harbour'],
            'pembayaran' => ['pembayaran', 'payment', 'bayar', 'transfer', 'e-wallet', 'virtual account', 'kartu kredit'],
            'rute' => ['rute', 'route', 'tujuan', 'destination', 'arah', 'jalur', 'perjalanan', 'trip'],
            'fasilitas' => ['fasilitas', 'facility', 'layanan', 'service', 'akomodasi', 'fitur', 'amenities'],
            'promo' => ['promo', 'diskon', 'voucher', 'discount', 'potongan', 'kupon', 'special offer'],
            'dokumen' => ['dokumen', 'document', 'identitas', 'ktp', 'passport', 'id card', 'surat'],
            'waktu' => ['pagi', 'siang', 'sore', 'malam', 'jam', 'menit', 'hari', 'besok', 'lusa']
        ];

        // Intent priority untuk menangani overlapping intent
        $intentPriority = [
            'refund' => 10,
            'reschedule' => 9,
            'pemesanan_tiket' => 8,
            'pembayaran' => 7,
            'check_in' => 6,
            'informasi_jadwal' => 5,
            'informasi_harga' => 4,
            'keluhan' => 4,
            'konfirmasi_status' => 3
        ];

        // Deteksi intent
        $detectedIntents = [];

        foreach ($intents as $intent => $intentKeywords) {
            $score = 0;
            $matches = [];

            foreach ($intentKeywords as $intentKeyword) {
                if (stripos($message, $intentKeyword) !== false) {
                    $score++;
                    $matches[] = $intentKeyword;
                }
            }

            if ($score > 0) {
                $priority = $intentPriority[$intent] ?? 0;
                $detectedIntents[] = [
                    'intent' => $intent,
                    'score' => $score,
                    'matches' => $matches,
                    'priority' => $priority,
                    'confidence' => min(1.0, $score / 3) // Normalisasi skor antara 0-1
                ];
            }
        }

        // Jika ada beberapa intent, pilih berdasarkan skor dan prioritas
        if (count($detectedIntents) > 0) {
            // Sort berdasarkan skor dulu, kemudian berdasarkan prioritas jika skor sama
            usort($detectedIntents, function ($a, $b) {
                if ($a['score'] == $b['score']) {
                    return $b['priority'] - $a['priority']; // Prioritas tinggi didahulukan
                }
                return $b['score'] - $a['score']; // Skor tinggi didahulukan
            });

            $detectedIntent = $detectedIntents[0]['intent'];
            $intentConfidence = $detectedIntents[0]['confidence'];
        } else {
            $detectedIntent = null;
            $intentConfidence = 0;
        }

        // Deteksi entity
        $detectedEntities = [];

        foreach ($entities as $entity => $entityKeywords) {
            $score = 0;
            $matches = [];

            foreach ($entityKeywords as $entityKeyword) {
                if (stripos($message, $entityKeyword) !== false) {
                    $score++;
                    $matches[] = $entityKeyword;
                }
            }

            if ($score > 0) {
                $detectedEntities[] = [
                    'entity' => $entity,
                    'score' => $score,
                    'matches' => $matches,
                    'confidence' => min(1.0, $score / 2) // Normalisasi skor antara 0-1
                ];
            }
        }

        // Deteksi entity dari konteks jika tidak terdeteksi dari pesan
        if (empty($detectedEntities) && isset($context['detected_entities']) && !empty($context['detected_entities'])) {
            foreach ($context['detected_entities'] as $contextEntity) {
                if (strpos($contextEntity, 'rute:') === 0) {
                    $detectedEntities[] = [
                        'entity' => 'rute',
                        'score' => 0.7,
                        'matches' => [str_replace('rute:', '', $contextEntity)],
                        'confidence' => 0.7,
                        'from_context' => true
                    ];
                } elseif (in_array($contextEntity, array_keys($entities))) {
                    $detectedEntities[] = [
                        'entity' => $contextEntity,
                        'score' => 0.6,
                        'matches' => [$contextEntity],
                        'confidence' => 0.6,
                        'from_context' => true
                    ];
                }
            }
        }

        // Pilih entity dengan skor tertinggi
        $detectedEntity = null;
        $entityConfidence = 0;

        if (count($detectedEntities) > 0) {
            usort($detectedEntities, function ($a, $b) {
                return $b['score'] - $a['score'];
            });

            $detectedEntity = $detectedEntities[0]['entity'];
            $entityConfidence = $detectedEntities[0]['confidence'];
        }

        // Untuk intent dan entity yang perlu kontek tambahan
        $modifiedIntent = $detectedIntent;

        // Logika khusus domain: jika entity "harga" dan intent "informasi", ubah ke "informasi_harga"
        if ($detectedEntity == 'harga' && ($detectedIntent == 'informasi_jadwal' || $detectedIntent == null)) {
            $modifiedIntent = 'informasi_harga';
            $intentConfidence = max($intentConfidence, 0.7);
        }

        // Jika entity "tiket" dan action words seperti "pesan", "beli", pastikan intent "pemesanan_tiket"
        if ($detectedEntity == 'tiket' && (stripos($message, 'pesan') !== false || stripos($message, 'beli') !== false)) {
            $modifiedIntent = 'pemesanan_tiket';
            $intentConfidence = max($intentConfidence, 0.8);
        }

        // Analisis tambahan untuk kata kunci
        foreach ($keywords as $keyword) {
            // Periksa apakah keyword cocok dengan entity yang belum terdeteksi
            foreach ($entities as $entity => $entityKeywords) {
                if ($detectedEntity !== $entity) { // Hanya periksa entity yang belum terdeteksi
                    foreach ($entityKeywords as $entityKeyword) {
                        if (stripos($keyword, $entityKeyword) !== false || stripos($entityKeyword, $keyword) !== false) {
                            // Jika ada kesamaan, tambahkan sebagai entity sekunder
                            $secondaryEntity = $entity;
                            $detectedEntity = $detectedEntity ?? $entity;
                            break 2;
                        }
                    }
                }
            }
        }

        // Map intent ke kategori untuk keperluan respons
        $categoryFromIntent = $this->getCategoryFromIntentEntity($modifiedIntent, $detectedEntity);

        // Hitung overall confidence
        $overallConfidence = 0;
        if ($intentConfidence > 0 && $entityConfidence > 0) {
            $overallConfidence = ($intentConfidence + $entityConfidence) / 2;
        } elseif ($intentConfidence > 0) {
            $overallConfidence = $intentConfidence * 0.7;
        } elseif ($entityConfidence > 0) {
            $overallConfidence = $entityConfidence * 0.6;
        }

        return [
            'intent' => $modifiedIntent,
            'entity' => $detectedEntity,
            'confidence' => $overallConfidence,
            'intent_details' => $detectedIntents,
            'entity_details' => $detectedEntities,
            'category_id' => $categoryFromIntent
        ];
    }

    /**
     * Mendapatkan ID kategori dari intent dan entity
     */
    private function getCategoryFromIntentEntity($intent, $entity)
    {
        // Map intent ke kategori
        $intentCategoryMap = [
            'informasi_jadwal' => $this->categoryMap['jadwal_rute'],
            'informasi_harga' => $this->categoryMap['informasi_umum'],
            'pemesanan_tiket' => $this->categoryMap['pemesanan'],
            'pembayaran' => $this->categoryMap['pembayaran'],
            'refund' => $this->categoryMap['refund_reschedule'],
            'reschedule' => $this->categoryMap['refund_reschedule'],
            'informasi_fasilitas' => $this->categoryMap['fasilitas'],
            'check_in' => $this->categoryMap['check_in'],
            'kendaraan' => $this->categoryMap['kendaraan_bagasi'],
            'bagasi' => $this->categoryMap['kendaraan_bagasi'],
            'bantuan' => $this->categoryMap['layanan_pelanggan'],
            'keluhan' => $this->categoryMap['layanan_pelanggan'],
            'informasi_promo' => $this->categoryMap['promo_diskon'],
            'informasi_akun' => $this->categoryMap['akun_pengguna']
        ];

        // Map entity ke kategori
        $entityCategoryMap = [
            'tiket' => $this->categoryMap['pemesanan'],
            'jadwal' => $this->categoryMap['jadwal_rute'],
            'kapal' => $this->categoryMap['informasi_umum'],
            'kendaraan' => $this->categoryMap['kendaraan_bagasi'],
            'harga' => $this->categoryMap['informasi_umum'],
            'akun' => $this->categoryMap['akun_pengguna'],
            'bagasi' => $this->categoryMap['kendaraan_bagasi'],
            'terminal' => $this->categoryMap['informasi_umum'],
            'pembayaran' => $this->categoryMap['pembayaran'],
            'rute' => $this->categoryMap['jadwal_rute'],
            'fasilitas' => $this->categoryMap['fasilitas'],
            'promo' => $this->categoryMap['promo_diskon']
        ];

        // Prioritaskan intent jika tersedia
        if ($intent && isset($intentCategoryMap[$intent])) {
            return $intentCategoryMap[$intent];
        }

        // Gunakan entity jika tidak ada intent
        if ($entity && isset($entityCategoryMap[$entity])) {
            return $entityCategoryMap[$entity];
        }

        return null;
    }

    /**
     * Memberikan saran pertanyaan yang lebih cerdas berdasarkan analisis percakapan
     */
    private function getSmartSuggestedQuestions($keywords, $context, $intentEntity)
    {
        $suggestedQuestions = [];

        // Jika entity terdeteksi tapi intent tidak jelas, sarankan pertanyaan umum tentang entity tersebut
        if (!empty($intentEntity['entity']) && empty($intentEntity['intent'])) {
            $entity = $intentEntity['entity'];

            switch ($entity) {
                case 'tiket':
                    $suggestedQuestions[] = [
                        'id' => null,
                        'question' => 'Bagaimana cara memesan tiket?'
                    ];
                    $suggestedQuestions[] = [
                        'id' => null,
                        'question' => 'Berapa harga tiket untuk rute populer?'
                    ];
                    break;
                case 'jadwal':
                    $suggestedQuestions[] = [
                        'id' => null,
                        'question' => 'Apa saja jadwal keberangkatan hari ini?'
                    ];
                    $suggestedQuestions[] = [
                        'id' => null,
                        'question' => 'Jadwal feri rute Merak-Bakauheni'
                    ];
                    break;
                case 'pembayaran':
                    $suggestedQuestions[] = [
                        'id' => null,
                        'question' => 'Metode pembayaran apa saja yang tersedia?'
                    ];
                    $suggestedQuestions[] = [
                        'id' => null,
                        'question' => 'Bagaimana cara melakukan pembayaran?'
                    ];
                    break;
                case 'kendaraan':
                    $suggestedQuestions[] = [
                        'id' => null,
                        'question' => 'Berapa biaya tambahan untuk membawa kendaraan?'
                    ];
                    $suggestedQuestions[] = [
                        'id' => null,
                        'question' => 'Bagaimana prosedur check-in kendaraan?'
                    ];
                    break;
                default:
                    // Gunakan pendekatan kata kunci untuk entity yang tidak spesifik ditangani
                    $popularTemplates = ChatTemplate::whereRaw('LOWER(keywords) LIKE ?', ['%' . strtolower($entity) . '%'])
                        ->orderBy('priority', 'desc')
                        ->take(2)
                        ->get(['id', 'question_pattern']);

                    foreach ($popularTemplates as $template) {
                        $suggestedQuestions[] = [
                            'id' => $template->id,
                            'question' => $template->question_pattern
                        ];
                    }
            }
        }

        // Jika intent terdeteksi tapi entity tidak, sarankan pertanyaan umum untuk intent tersebut
        if (!empty($intentEntity['intent']) && empty($intentEntity['entity'])) {
            $intent = $intentEntity['intent'];

            switch ($intent) {
                case 'informasi_jadwal':
                    $suggestedQuestions[] = [
                        'id' => null,
                        'question' => 'Apa saja jadwal keberangkatan hari ini?'
                    ];
                    break;
                case 'pemesanan_tiket':
                    $suggestedQuestions[] = [
                        'id' => null,
                        'question' => 'Bagaimana cara memesan tiket?'
                    ];
                    break;
                case 'pembayaran':
                    $suggestedQuestions[] = [
                        'id' => null,
                        'question' => 'Metode pembayaran apa saja yang tersedia?'
                    ];
                    break;
                case 'refund':
                    $suggestedQuestions[] = [
                        'id' => null,
                        'question' => 'Bagaimana cara refund tiket?'
                    ];
                    break;
                case 'reschedule':
                    $suggestedQuestions[] = [
                        'id' => null,
                        'question' => 'Bagaimana cara mengubah jadwal perjalanan?'
                    ];
                    break;
            }
        }

        // Jika sudah ada beberapa saran, kembalikan
        if (count($suggestedQuestions) >= 2) {
            return array_slice($suggestedQuestions, 0, 3);
        }

        // Jika masih kurang, tambahkan dari kata kunci
        if (!empty($keywords)) {
            $keywordQuestions = [];
            $processedKeywords = array_slice($keywords, 0, min(3, count($keywords)));

            foreach ($processedKeywords as $keyword) {
                $templates = ChatTemplate::whereRaw('LOWER(keywords) LIKE ?', ['%' . strtolower($keyword) . '%'])
                    ->orderBy('priority', 'desc')
                    ->take(2)
                    ->get(['id', 'question_pattern']);

                foreach ($templates as $template) {
                    // Cek duplikat
                    $isDuplicate = false;
                    foreach ($suggestedQuestions as $existing) {
                        if (isset($existing['id']) && $existing['id'] == $template->id) {
                            $isDuplicate = true;
                            break;
                        }
                    }

                    if (!$isDuplicate) {
                        $keywordQuestions[] = [
                            'id' => $template->id,
                            'question' => $template->question_pattern
                        ];
                    }
                }
            }

            $suggestedQuestions = array_merge($suggestedQuestions, $keywordQuestions);
        }

        // Jika masih kurang dari 3, tambahkan pertanyaan populer
        if (count($suggestedQuestions) < 3) {
            $popularQuestions = [
                'Bagaimana cara memesan tiket feri?',
                'Apa saja metode pembayaran yang tersedia?',
                'Berapa batas waktu check-in?',
                'Bagaimana jika saya ingin membawa kendaraan?',
                'Apakah ada promo untuk perjalanan saat ini?'
            ];

            foreach ($popularQuestions as $question) {
                $isDuplicate = false;
                foreach ($suggestedQuestions as $existing) {
                    if ($existing['question'] == $question) {
                        $isDuplicate = true;
                        break;
                    }
                }

                if (!$isDuplicate) {
                    $suggestedQuestions[] = [
                        'id' => null,
                        'question' => $question
                    ];
                }

                if (count($suggestedQuestions) >= 3) {
                    break;
                }
            }
        }

        return array_slice($suggestedQuestions, 0, 3);
    }

    /**
     * Mencari template alternatif jika tidak ada match yang bagus - ditingkatkan dengan context awareness
     */
    private function findAlternativeMatch($keywords, $context, $entities = [])
    {
        if (empty($keywords) && empty($entities)) {
            return null;
        }

        // Template IDs untuk dipertimbangkan
        $templateIds = [];

        // Pertama, cari berdasarkan entity yang terdeteksi (prioritas lebih tinggi)
        if (!empty($entities)) {
            foreach ($entities as $entity) {
                $entityKeywords = [];

                // Map entity ke kata kunci terkait
                switch ($entity) {
                    case 'tiket':
                        $entityKeywords = ['tiket', 'ticket', 'booking', 'pemesanan'];
                        break;
                    case 'jadwal':
                        $entityKeywords = ['jadwal', 'schedule', 'keberangkatan'];
                        break;
                    case 'pembayaran':
                        $entityKeywords = ['bayar', 'payment', 'pembayaran', 'metode'];
                        break;
                    case 'kendaraan':
                        $entityKeywords = ['kendaraan', 'mobil', 'motor', 'vehicle'];
                        break;
                    // Tambahkan case untuk entity lain
                    default:
                        $entityKeywords = [$entity];
                }

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

        // Tambahkan template berdasarkan kata kunci (jika masih dibutuhkan)
        if (count($templateIds) < 5 && !empty($keywords)) {
            $primaryKeywords = array_slice($keywords, 0, min(3, count($keywords)));

            foreach ($primaryKeywords as $keyword) {
                $matches = ChatTemplate::whereRaw('LOWER(keywords) LIKE ?', ['%' . strtolower($keyword) . '%'])
                    ->orderBy('priority', 'desc')
                    ->take(3)
                    ->pluck('id')
                    ->toArray();

                $templateIds = array_merge($templateIds, $matches);
            }
        }

        // Hilangkan duplikat
        $templateIds = array_unique($templateIds);

        if (empty($templateIds)) {
            return null;
        }

        // Prioritaskan kategori yang terakhir diakses jika ada
        if (!empty($context['last_category_id'])) {
            $template = ChatTemplate::whereIn('id', $templateIds)
                ->where('category_id', $context['last_category_id'])
                ->orderBy('priority', 'desc')
                ->first();

            if ($template) {
                return $template;
            }
        }

        // Prioritaskan kategori yang sering ditanyakan pengguna jika tidak ada konteks terakhir
        if (!empty($context['user_preferences'])) {
            $preferredCategories = [];

            foreach ($context['user_preferences'] as $key => $value) {
                if (strpos($key, 'category_') === 0 && is_numeric($value) && $value > 0) {
                    $categoryId = (int)str_replace('category_', '', $key);
                    $preferredCategories[$categoryId] = $value;
                }
            }

            if (!empty($preferredCategories)) {
                arsort($preferredCategories); // Sort berdasarkan nilai (jumlah preferensi)

                foreach (array_keys($preferredCategories) as $categoryId) {
                    $template = ChatTemplate::whereIn('id', $templateIds)
                        ->where('category_id', $categoryId)
                        ->orderBy('priority', 'desc')
                        ->first();

                    if ($template) {
                        return $template;
                    }
                }
            }
        }

        // Jika tidak ada kategori yang cocok, ambil template dengan prioritas tertinggi
        return ChatTemplate::whereIn('id', $templateIds)
            ->orderBy('priority', 'desc')
            ->first();
    }

    /**
     * Membersihkan teks dari karakter khusus dan mengubah ke huruf kecil - ditingkatkan
     */
    private function cleanText($text)
    {
        // Normalisasi spasi
        $text = preg_replace('/\s+/', ' ', $text);

        // Ubah ke huruf kecil
        $text = strtolower($text);

        // Hapus karakter khusus yang tidak perlu tapi pertahankan tanda tanya dan koma
        $text = preg_replace('/[^\p{L}\p{N}\s\?\,\.\-]/u', '', $text);

        // Normalisasi beberapa singkatan umum
        $text = str_replace(['tdk', 'tdk.', 'gk', 'ga', 'gak'], 'tidak', $text);
        $text = str_replace(['dgn', 'dg'], 'dengan', $text);
        $text = str_replace(['utk', 'u/'], 'untuk', $text);
        $text = str_replace(['yg'], 'yang', $text);
        $text = str_replace(['sy', 'sya'], 'saya', $text);
        $text = str_replace(['bs', 'bsa'], 'bisa', $text);
        $text = str_replace(['thx', 'tq', 'ty', 'trims'], 'terima kasih', $text);
        $text = str_replace(['gmn', 'gmna'], 'bagaimana', $text);
        $text = str_replace(['hr', 'hri'], 'hari', $text);
        $text = str_replace(['bln'], 'bulan', $text);
        $text = str_replace(['thn'], 'tahun', $text);
        $text = str_replace(['skrg'], 'sekarang', $text);
        $text = str_replace(['info'], 'informasi', $text);

        // Hapus spasi berlebih
        $text = preg_replace('/\s+/', ' ', $text);

        return trim($text);
    }

    /**
     * Deteksi tipe pertanyaan (informasi, aksi, konfirmasi, dll)
     */
    private function detectQuestionType($message)
    {
        // Marker untuk tipe pertanyaan
        $informationMarkers = ['apa', 'siapa', 'dimana', 'kapan', 'mengapa', 'bagaimana', 'berapa', 'kenapa'];
        $confirmationMarkers = ['apakah', 'bisakah', 'bolehkah', 'dapatkah', 'mungkinkah'];
        $actionMarkers = ['tolong', 'bantu', 'lakukan', 'carikan', 'cek', 'periksa', 'mohon'];

        // Cek tanda tanya
        $hasQuestionMark = strpos($message, '?') !== false;

        // Deteksi dengan marker
        foreach ($informationMarkers as $marker) {
            if (preg_match('/\b' . $marker . '\b/i', $message)) {
                return 'information';
            }
        }

        foreach ($confirmationMarkers as $marker) {
            if (preg_match('/\b' . $marker . '\b/i', $message)) {
                return 'confirmation';
            }
        }

        foreach ($actionMarkers as $marker) {
            if (preg_match('/\b' . $marker . '\b/i', $message)) {
                return 'action';
            }
        }

        // Default: jika ada tanda tanya, anggap information
        if ($hasQuestionMark) {
            return 'information';
        }

        // Jika tidak ada marker dan tidak ada tanda tanya, mungkin pernyataan
        return 'statement';
    }

    /**
     * Ekstrak kata kunci dari pesan dengan peningkatan
     */
    private function extractKeywords($text)
    {
        // Stopwords dalam Bahasa Indonesia - diperluas untuk lebih akurat
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
            'belum',
            'telah',
            'oleh',
            'sebagai',
            'juga',
            'tentang',
            'hal',
            'dapat',
            'secara',
            'sangat',
            'hanya',
            'mungkin',
            'setiap',
            'semua',
            'saat',
            'sedang',
            'masih',
            'lagi',
            'tapi',
            'namun',
            'karena',
            'ketika',
            'sebelum',
            'sesudah',
            'selama',
            'bahwa',
            'sampai',
            'hingga',
            'seperti',
            'sebab',
            'akibat',
            'jadi',
            'agar',
            'supaya',
            'sehingga',
            'tetapi',
            'melainkan',
            'selain',
            'kecuali',
            'terhadap',
            'mengenai',
            'melalui',
            'berdasarkan',
            'menurut',
            'sesuai',
            'ingin',
            'mau'
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

        // Analisis frasa dengan sliding window
        $phrases = [];
        $wordCount = count($words);

        // Jendela 2-gram dan 3-gram
        for ($i = 0; $i < $wordCount - 1; $i++) {
            // 2-gram
            $phrase2 = $words[$i] . ' ' . $words[$i + 1];
            $isStopPhrase = false;

            // Cek apakah frasa hanya terdiri dari stopwords
            $phraseWords = [$words[$i], $words[$i + 1]];
            $stopwordCount = 0;
            foreach ($phraseWords as $w) {
                if (in_array($w, $stopwords)) {
                    $stopwordCount++;
                }
            }

            if ($stopwordCount < count($phraseWords)) {
                $phrases[] = $phrase2;
            }

            // 3-gram
            if ($i < $wordCount - 2) {
                $phrase3 = $words[$i] . ' ' . $words[$i + 1] . ' ' . $words[$i + 2];

                // Cek apakah frasa hanya terdiri dari stopwords
                $phraseWords = [$words[$i], $words[$i + 1], $words[$i + 2]];
                $stopwordCount = 0;
                foreach ($phraseWords as $w) {
                    if (in_array($w, $stopwords)) {
                        $stopwordCount++;
                    }
                }

                if ($stopwordCount < count($phraseWords)) {
                    $phrases[] = $phrase3;
                }
            }
        }

        // Tambahkan frasa ke keyword list
        $keywordList = array_values($keywords);
        $keywordList = array_merge($keywordList, $phrases);

        // Tambahkan tipe pertanyaan sebagai kata kunci jika ada
        if ($questionType && !in_array($questionType, $keywordList)) {
            array_unshift($keywordList, $questionType);
        }

        return $keywordList;
    }

    /**
     * Temukan template terbaik berdasarkan kecocokan dengan algoritma yang ditingkatkan
     */
    private function findBestTemplate($message, $keywords, $context = null, $intentEntity = null, $questionType = null, $isFollowUpQuestion = false)
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
        $intentBoost = 0.1; // Boost untuk kecocokan intent
        $continuityBoost = 0.05; // Boost untuk kontinuitas dialog
        $followUpBoost = 0.1; // Boost untuk pertanyaan lanjutan

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

            // Tambahkan bobot untuk intent entity match
            if ($intentEntity && (isset($intentEntity['entity']) || isset($intentEntity['intent']))) {
                // Cek apakah kategori template cocok dengan kategori yang disarankan oleh intent/entity
                if (isset($intentEntity['category_id']) && $intentEntity['category_id'] == $template->category_id) {
                    $score += $intentBoost;
                } else {
                    $intentEntityBoost = $this->calculateIntentEntityBoost($template, $intentEntity);
                    $score += $intentEntityBoost;
                }
            }

            // Tambahkan boost untuk kontinuitas percakapan (jika ini kelanjutan dari pertanyaan sebelumnya)
            if ($context && !empty($context['last_queries'])) {
                $continuity = $this->checkDialogContinuity($message, $context['last_queries'], $template);
                $score += $continuity * $continuityBoost;
            }

            // Tambahkan boost untuk pertanyaan lanjutan jika terdeteksi
            if ($isFollowUpQuestion && $context && isset($context['last_category_id']) && $context['last_category_id'] == $template->category_id) {
                $score += $followUpBoost;
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

        // Jika perbedaan skor terlalu kecil dan ambiguitas tinggi, prioritaskan template dengan prioritas lebih tinggi
        if ($secondBestMatch && ($highestScore - $secondHighestScore < 0.1) && $bestMatch->priority < $secondBestMatch->priority) {
            $bestMatch = $secondBestMatch;
            $bestMatch->score = $secondHighestScore;
        }

        // Simpan hasil ke cache selama 1 jam untuk optimasi performa
        if ($bestMatch) {
            Cache::put($cacheKey, $bestMatch, 3600);
        }

        return $bestMatch;
    }

    /**
     * Cek kontinuitas dialog
     */
    private function checkDialogContinuity($currentMessage, $lastQueries, $template)
    {
        if (empty($lastQueries) || count($lastQueries) < 2) {
            return 0;
        }

        // Ambil pertanyaan terakhir (tidak termasuk pesan saat ini)
        $lastQuery = $lastQueries[0]['message'] ?? '';

        // Cek apakah ada pola kontinuitas
        $continuityPatterns = [
            // Jawaban singkat yang merujuk pada konteks sebelumnya
            '/^(ya|tidak|oke|ok|baik|bagaimana|lalu|kemudian|terus)/i',
            // Pertanyaan lanjutan tanpa subjek lengkap
            '/^(bagaimana dengan|kapan|dimana|mengapa|siapa|berapa)/i',
            // Referensi ke percakapan sebelumnya
            '/(tersebut|itu|tadi|sebelumnya)/i'
        ];

        foreach ($continuityPatterns as $pattern) {
            if (preg_match($pattern, $currentMessage)) {
                // Ada indikasi kontinuitas, beri boost jika kategori sama dengan template sebelumnya
                $lastCategory = $this->extractCategoryFromMessage($lastQuery);
                if ($lastCategory && $lastCategory == $template->category_id) {
                    return 1.0; // Full boost untuk kontinuitas yang jelas
                } else {
                    return 0.5; // Setengah boost jika kategori berbeda
                }
            }
        }

        return 0;
    }

    /**
     * Ekstrak kategori dari pesan (untuk kontinuitas dialog)
     */
    private function extractCategoryFromMessage($message)
    {
        // Clean message
        $cleanedMessage = $this->cleanText($message);

        // Extract keywords
        $keywords = $this->extractKeywords($cleanedMessage);

        if (empty($keywords)) {
            return null;
        }

        // Cari template yang cocok
        $bestScore = 0;
        $bestCategory = null;

        $templates = ChatTemplate::all();

        foreach ($templates as $template) {
            $score = $this->calculateBasicMatchScore($cleanedMessage, $keywords, $template);

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestCategory = $template->category_id;
            }
        }

        // Hanya return jika skor cukup tinggi
        return ($bestScore > 0.3) ? $bestCategory : null;
    }

    /**
     * Hitung skor kecocokan dasar (untuk kontinuitas dialog)
     */
    private function calculateBasicMatchScore($message, $keywords, $template)
    {
        // Skor dasar
        $score = 0;

        // Pattern matching sederhana
        $pattern = $this->cleanText($template->question_pattern);

        // Directly check for keyword matches in template keywords
        $templateKeywords = explode(',', $template->keywords);
        $keywordMatches = 0;

        foreach ($keywords as $keyword) {
            foreach ($templateKeywords as $templateKeyword) {
                $templateKeyword = trim($templateKeyword);

                if (
                    strpos($keyword, $templateKeyword) !== false ||
                    strpos($templateKeyword, $keyword) !== false
                ) {
                    $keywordMatches++;
                    break;
                }
            }
        }

        $score = count($keywords) > 0 ? min(1, $keywordMatches / count($keywords)) : 0;

        return $score;
    }

    /**
     * Hitung bobot dari kecocokan intent & entity
     */
    private function calculateIntentEntityBoost($template, $intentEntity)
    {
        $boost = 0;

        // Periksa apakah keyword template mengandung entity yang terdeteksi
        if (isset($intentEntity['entity'])) {
            $entity = $intentEntity['entity'];
            if (stripos($template->keywords, $entity) !== false) {
                $boost += 0.05;
            }

            // Periksa juga di question pattern
            if (stripos($template->question_pattern, $entity) !== false) {
                $boost += 0.05;
            }
        }

        // Cek intent juga
        if (isset($intentEntity['intent'])) {
            $intent = $intentEntity['intent'];

            // Map intent ke kategori yang sesuai dengan seeder
            $intentCategoryMap = [
                'informasi_jadwal' => [2], // Jadwal & Rute
                'informasi_harga' => [1], // Informasi Umum
                'pemesanan_tiket' => [3], // Pemesanan
                'pembayaran' => [4], // Pembayaran
                'refund' => [12], // Refund & Reschedule
                'reschedule' => [12], // Refund & Reschedule
                'informasi_fasilitas' => [6], // Fasilitas
                'check_in' => [14], // Check-in
                'kendaraan' => [7], // Kendaraan & Bagasi
                'bagasi' => [7], // Kendaraan & Bagasi
                'bantuan' => [8], // Layanan Pelanggan
                'keluhan' => [8], // Layanan Pelanggan
                'informasi_promo' => [16], // Promo & Diskon
                'informasi_akun' => [11] // Akun Pengguna
            ];

            if (isset($intentCategoryMap[$intent]) && in_array($template->category_id, $intentCategoryMap[$intent])) {
                $boost += 0.1; // Berikan boost lebih besar untuk kategori yang tepat
            }
        }

        return min(0.15, $boost); // Maksimal 15% boost
    }

    /**
     * Hitung bobot kontekstual untuk kata kunci yang baru disebutkan
     */
    private function calculateKeywordContextBoost($template, $recentKeywords)
    {
        $templateKeywords = explode(',', $template->keywords);
        $matchCount = 0;
        $weightedMatchCount = 0;

        foreach ($templateKeywords as $templateKeyword) {
            $templateKeyword = trim($templateKeyword);
            foreach ($recentKeywords as $index => $recentKeyword) {
                $weight = 1 - ($index / count($recentKeywords)) * 0.5; // Keywords terbaru memiliki bobot lebih tinggi

                if (stripos($templateKeyword, $recentKeyword) !== false || stripos($recentKeyword, $templateKeyword) !== false) {
                    $matchCount++;
                    $weightedMatchCount += $weight;
                }
            }
        }

        // Maksimal boost 15% untuk kata kunci terkait konteks
        return min(0.15, $weightedMatchCount * 0.025);
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

        // Tambahkan skor cosine similarity (25%)
        $score += $cosineSimilarity * 0.25;

        // Tambahkan skor Levenshtein yang dinormalisasi (15%)
        $messageLength = strlen($message);
        $patternLength = strlen($pattern);
        $maxLength = max($messageLength, $patternLength);

        if ($maxLength > 0) {
            $levenDist = levenshtein($message, $pattern);
            $levenSimilarity = ($maxLength - $levenDist) / $maxLength;
            $score += $levenSimilarity * 0.15;
        }

        // Kecocokan kata kunci dengan template (45%)
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

        // Kecocokan kata kunci individu
        foreach ($keywords as $keyword) {
            foreach ($templateKeywords as $templateKeyword) {
                $templateKeyword = trim($templateKeyword);

                // Cek kecocokan partial dan pola stemming sederhana
                $keywordStem = $this->simpleStem($keyword);
                $templateStem = $this->simpleStem($templateKeyword);

                if (
                    strpos($keywordStem, $templateStem) !== false ||
                    strpos($templateStem, $keywordStem) !== false ||
                    similar_text($keywordStem, $templateStem) / max(strlen($keywordStem), strlen($templateStem)) > 0.8
                ) {
                    $matchValue = isset($keywordImportance[$templateKeyword]) ? $keywordImportance[$templateKeyword] : 1;
                    $keywordMatches += $matchValue;
                    break;
                }
            }
        }

        // Kecocokan frasa
        foreach ($keywords as $keyword) {
            // Cek apakah ini adalah frasa (multi-kata)
            if (strpos($keyword, ' ') !== false) {
                // Ini adalah frasa
                foreach ($templateKeywords as $templateKeyword) {
                    $templateKeyword = trim($templateKeyword);

                    // Cek kecocokan phrase yang lebih kuat
                    if (
                        stripos($keyword, $templateKeyword) !== false ||
                        stripos($templateKeyword, $keyword) !== false ||
                        similar_text($keyword, $templateKeyword) / max(strlen($keyword), strlen($templateKeyword)) > 0.7
                    ) {
                        // Frasa memberikan bobot lebih tinggi (2x) dari kata kunci biasa
                        $matchValue = (isset($keywordImportance[$templateKeyword]) ? $keywordImportance[$templateKeyword] : 1) * 2;
                        $keywordMatches += $matchValue;
                        break;
                    }
                }
            }
        }

        $keywordScore = count($keywords) > 0 ? min(1, $keywordMatches / (count($keywords) * 1.5)) : 0;
        $score += $keywordScore * 0.45;

        // Prioritas template (0-10) dengan pengaruh yang lebih signifikan (15%)
        $priorityBoost = $template->priority / 10 * 0.15;
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
                'unanswered_count' => 0,
                'user_preferences' => [],
                'last_queries' => [],
                'conversation_flow' => [],
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
                'conversation_flow' => [],
                'detected_entities' => []
            ];
        }

        return json_decode($conversation->context, true);
    }

    /**
     * Update konteks last queries untuk analisis percakapan
     */
    private function updateLastQueriesContext($conversationId, &$context, $message)
    {
        // Simpan 5 pertanyaan terakhir untuk analisis konteks percakapan
        $lastQueries = $context['last_queries'] ?? [];
        array_unshift($lastQueries, [
            'message' => $message,
            'timestamp' => time()
        ]);

        // Keep only the last 5 queries
        $context['last_queries'] = array_slice($lastQueries, 0, 5);

        // Save the updated context
        $conversation = ChatConversation::find($conversationId);
        if ($conversation) {
            $conversation->update(['context' => json_encode($context)]);
        }
    }

    /**
     * Update konteks percakapan setelah menemukan template yang cocok
     */
    private function updateConversationContext($conversationId, $context, $keywords, $bestMatch, $sentiment = null, $intentEntity = null)
    {
        // Update data konteks
        $context['last_category_id'] = $bestMatch->category_id;
        $context['chat_count'] = ($context['chat_count'] ?? 0) + 1;

        // Simpan keywords terbaru (maksimal 15)
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

        // Analisis preferensi pengguna berdasarkan kategori pertanyaan
        $userPreferences = $context['user_preferences'] ?? [];

        // Track kategori yang sering ditanyakan
        $categoryKey = 'category_' . $bestMatch->category_id;
        $userPreferences[$categoryKey] = ($userPreferences[$categoryKey] ?? 0) + 1;

        // Track entity yang menarik bagi pengguna
        if ($intentEntity && $intentEntity['entity']) {
            $entityKey = $intentEntity['entity'] . '_interest';
            $userPreferences[$entityKey] = ($userPreferences[$entityKey] ?? 0) + 1;
        }

        // Catat sentimen untuk analisis kualitas layanan
        if ($sentiment && is_array($sentiment)) {
            $userPreferences['sentiment_history'] = $userPreferences['sentiment_history'] ?? [];
            $userPreferences['sentiment_history'][] = [
                'sentiment' => $sentiment['sentiment'],
                'timestamp' => time(),
                'emotion' => $sentiment['emotion'] ?? null
            ];

            // Batasi riwayat sentimen (simpan 10 terakhir)
            if (count($userPreferences['sentiment_history']) > 10) {
                $userPreferences['sentiment_history'] = array_slice($userPreferences['sentiment_history'], -10);
            }
        }

        $context['user_preferences'] = $userPreferences;

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
     * Memproses jawaban template untuk personalisasi
     */
    private function processTemplateAnswer($answer, $context)
    {
        // Jika ada variabel yang perlu dimasukkan ke dalam template
        $processedAnswer = $answer;

        // Ubah placeholder {user_name} jika ada di konteks
        if (isset($context['user_name']) && $context['user_name']) {
            $processedAnswer = str_replace('{user_name}', $context['user_name'], $processedAnswer);
        }

        // Ubah placeholder {last_search} jika ada
        if (isset($context['last_search']) && $context['last_search']) {
            $processedAnswer = str_replace('{last_search}', $context['last_search'], $processedAnswer);
        }

        // Tambahkan personalisasi berdasarkan riwayat
        if (!empty($context['user_preferences'])) {
            // Misalnya, jika user sering tanya tentang kendaraan, tambahkan info kendaraan
            if (isset($context['user_preferences']['vehicle_interest']) && $context['user_preferences']['vehicle_interest'] > 2) {
                if (strpos($processedAnswer, 'kendaraan') !== false && !strpos($processedAnswer, 'Untuk informasi lebih lengkap tentang kendaraan')) {
                    $processedAnswer .= "\n\nUntuk informasi lebih lengkap tentang kendaraan di kapal kami, silakan lihat bagian 'Kendaraan & Bagasi' di aplikasi.";
                }
            }
        }

        return $processedAnswer;
    }
}
