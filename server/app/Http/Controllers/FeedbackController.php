<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class FeedbackController extends Controller
{
    /**
     * Lấy danh sách tất cả feedback (chỉ dành cho admin).
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $feedbacks = Feedback::with('user:id,firstName,lastName,email')
                             ->orderBy('created_at', 'desc')
                             ->get();

        return response()->json($feedbacks);
    }

    /**
     * Lưu một feedback mới từ người dùng.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string|min:10',
            'context' => 'nullable|array',
        ]);

        $feedback = $request->user()->feedbacks()->create($validated);

        return response()->json([
            'message' => 'Feedback submitted successfully!',
            'feedback' => $feedback
        ], 201);
    }

    /**
     * Cập nhật trạng thái của một feedback (chỉ dành cho admin).
     */
    public function updateStatus(Request $request, Feedback $feedback)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(['new', 'read', 'resolved'])],
        ]);

        $feedback->update(['status' => $validated['status']]);

        return response()->json(['message' => 'Feedback status updated.']);
    }

    /**
     * Xóa một feedback (chỉ dành cho admin).
     */
    public function destroy(Request $request, Feedback $feedback)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $feedback->delete();

        return response()->json(['message' => 'Feedback deleted successfully.']);
    }
}
