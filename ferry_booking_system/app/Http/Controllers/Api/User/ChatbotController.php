<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;
use App\Services\ChatbotService;
use App\Models\ChatMessage;
use App\Models\ChatFeedback;
use App\Models\ChatConversation;
use Illuminate\Support\Facades\Validator;

class ChatbotController extends BaseController
{
    protected $chatbotService;

    public function __construct(ChatbotService $chatbotService)
    {
        $this->chatbotService = $chatbotService;
        // Middleware auth:sanctum hanya pada endpoint yang memerlukan autentikasi
        $this->middleware('auth:sanctum')->only(['getUserConversations']);
    }

    /**
     * Mendapatkan atau membuat percakapan baru
     */
    public function getConversation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_id' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Ambil user_id jika user login
        $userId = auth('sanctum')->check() ? auth('sanctum')->id() : null;

        // Ambil device_id dari request
        $deviceId = $request->device_id;

        // Dapatkan atau buat percakapan
        $conversation = $this->chatbotService->getOrCreateConversation($userId, $deviceId);

        // Ambil 20 pesan terakhir
        $messages = ChatMessage::where('conversation_id', $conversation->id)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->reverse()
            ->values();

        return response()->json([
            'success' => true,
            'message' => 'Percakapan berhasil dimuat',
            'data' => [
                'conversation' => [
                    'id' => $conversation->id,
                    'user_id' => $conversation->user_id,
                    'session_id' => $conversation->session_id,
                ],
                'messages' => $messages->map(function ($message) {
                    return [
                        'id' => $message->id,
                        'is_from_user' => (bool) $message->is_from_user,
                        'message' => $message->message,
                        'created_at' => $message->created_at,
                    ];
                })
            ]
        ]);
    }

    /**
     * Mendapatkan semua percakapan pengguna yang login
     * Endpoint ini memerlukan autentikasi
     */
    public function getUserConversations(Request $request)
    {
        $conversations = ChatConversation::where('user_id', auth('sanctum')->id())
            ->withCount('messages')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar percakapan berhasil dimuat',
            'data' => $conversations->map(function ($conversation) {
                $lastMessage = $conversation->messages()->latest()->first();
                return [
                    'id' => $conversation->id,
                    'session_id' => $conversation->session_id,
                    'messages_count' => $conversation->messages_count,
                    'created_at' => $conversation->created_at,
                    'updated_at' => $conversation->updated_at,
                    'last_message' => $lastMessage ? [
                        'message' => $lastMessage->message,
                        'is_from_user' => (bool) $lastMessage->is_from_user,
                        'created_at' => $lastMessage->created_at,
                    ] : null,
                ];
            })
        ]);
    }

    /**
     * Mengirim pesan dan mendapatkan jawaban
     */
    public function sendMessage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'conversation_id' => 'required|exists:chat_conversations,id',
            'message' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Jika user login, pastikan percakapan miliknya atau belum memiliki user_id
        if (auth('sanctum')->check()) {
            $conversation = ChatConversation::find($request->conversation_id);

            if ($conversation->user_id && $conversation->user_id != auth('sanctum')->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses ke percakapan ini'
                ], 403);
            }

            // Update percakapan dengan user_id jika belum ada
            if (!$conversation->user_id) {
                $conversation->update(['user_id' => auth('sanctum')->id()]);
            }
        }

        // Simpan pesan pengguna
        $userMessage = $this->chatbotService->saveMessage(
            $request->conversation_id,
            $request->message,
            true
        );

        // Dapatkan jawaban
        $response = $this->chatbotService->findAnswer($request->message);

        // Simpan jawaban chatbot
        $botMessage = $this->chatbotService->saveMessage(
            $request->conversation_id,
            $response['answer'],
            false,
            $response['template_id'] ?: null, // Pastikan nilai 0 bisa dikonversi ke null jika diperlukan
            $response['confidence_score']
        );

        // Update waktu terakhir percakapan
        ChatConversation::where('id', $request->conversation_id)->update([
            'updated_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesan berhasil dikirim',
            'data' => [
                'user_message' => [
                    'id' => $userMessage->id,
                    'is_from_user' => (bool) $userMessage->is_from_user,
                    'message' => $userMessage->message,
                    'created_at' => $userMessage->created_at
                ],
                'bot_message' => [
                    'id' => $botMessage->id,
                    'is_from_user' => (bool) $botMessage->is_from_user,
                    'message' => $botMessage->message,
                    'created_at' => $botMessage->created_at
                ]
            ]
        ]);
    }

    /**
     * Mengirim feedback
     */
    public function sendFeedback(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message_id' => 'required|exists:chat_messages,id',
            'is_helpful' => 'required|boolean',
            'feedback_text' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Cek apakah pesan yang diberi feedback bukan dari pengguna
        $message = ChatMessage::find($request->message_id);
        if (!$message || $message->is_from_user) {
            return response()->json([
                'success' => false,
                'message' => 'Feedback hanya dapat diberikan untuk pesan dari chatbot'
            ], 400);
        }

        // Jika user login, pastikan percakapan miliknya
        if (auth('sanctum')->check()) {
            $conversation = $message->conversation;

            if ($conversation->user_id && $conversation->user_id != auth('sanctum')->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses ke pesan ini'
                ], 403);
            }
        }

        // Cek apakah sudah ada feedback sebelumnya
        $existingFeedback = ChatFeedback::where('message_id', $request->message_id)->first();

        if ($existingFeedback) {
            $existingFeedback->update([
                'is_helpful' => $request->is_helpful,
                'feedback_text' => $request->feedback_text
            ]);
            $feedback = $existingFeedback;
        } else {
            $feedback = ChatFeedback::create([
                'message_id' => $request->message_id,
                'is_helpful' => $request->is_helpful,
                'feedback_text' => $request->feedback_text,
                'created_at' => now()
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Feedback berhasil dikirim',
            'data' => [
                'id' => $feedback->id,
                'is_helpful' => (bool) $feedback->is_helpful,
                'feedback_text' => $feedback->feedback_text,
                'created_at' => $feedback->created_at
            ]
        ]);
    }
}
