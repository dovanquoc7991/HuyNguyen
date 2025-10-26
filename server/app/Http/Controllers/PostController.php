<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;

class PostController extends Controller
{
    public function index(Request $request)
    {
        // Đảm bảo chỉ admin mới có quyền xem danh sách bài đăng
        // if ($request->user()->role !== 'admin') {
        //     return response()->json([
        //         'message' => 'You are not authorized to view posts.'
        //     ], 403);
        // }

        // Lấy tất cả bài đăng, sắp xếp theo ngày tạo mới nhất
        $posts = Post::latest()->get();

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        // Đảm bảo người dùng là admin
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'You are not authorized to perform this action.'
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:reading,listening',
            'audio_url' => 'nullable|url|max:255',
        ]);

        $post = Post::create($validated);

        return response()->json($post, 201);
    }

    public function show(Post $post)
    {
        // Laravel sẽ tự động tìm post hoặc trả về 404 nếu không thấy.
        return response()->json($post);
    }

    public function update(Request $request, Post $post)
    {
        // Đảm bảo người dùng là admin
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'You are not authorized to perform this action.'
            ], 403);
        }

        // Validate dữ liệu, 'sometimes' để chỉ validate khi trường đó được gửi lên
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'type' => 'sometimes|required|in:reading,listening',
            'audio_url' => 'nullable|url|max:255',
        ]);

        $post->update($validated);

        // Trả về bài đăng đã được cập nhật
        return response()->json($post);
    }

    public function destroy(Request $request, Post $post)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'You are not authorized to perform this action.'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully.']);
    }
}
