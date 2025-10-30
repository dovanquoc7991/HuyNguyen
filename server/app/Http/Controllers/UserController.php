<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Lấy danh sách tất cả người dùng.
     * Chỉ admin mới có quyền truy cập.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Kiểm tra xem người dùng có phải là admin không
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
        }

        // Tự động cập nhật trạng thái của người dùng đã hết hạn
        User::where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->update(['status' => 'disabled']);

        $users = User::all();

        return response()->json($users);
    }

    /**
     * Xóa một người dùng.
     * Chỉ admin mới có quyền truy cập.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, User $user)
    {
        // Kiểm tra xem người dùng có phải là admin không
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
        }

        // Admin không thể tự xóa chính mình
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Bạn không thể tự xóa chính mình.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Người dùng đã được xóa thành công.']);
    }

    /**
     * Cập nhật trạng thái của người dùng (active/disabled).
     * Chỉ admin mới có quyền truy cập.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, User $user)
    {
        // Kiểm tra xem người dùng có phải là admin không
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
        }

        // Admin không thể tự disable chính mình
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Bạn không thể tự thay đổi trạng thái của chính mình.'], 403);
        }

        $request->validate([
            'status' => 'required|in:active,disabled',
        ]);

        if ($request->status === 'active') {
            $user->update([
                'status' => 'active',
                'expires_at' => now()->addMonths(3)
            ]);
        } else {
            $user->update(['status' => 'disabled']);
        }

        return response()->json(['message' => 'Trạng thái người dùng đã được cập nhật thành công.', 'user' => $user->fresh()]);
    }

    /**
     * Cập nhật thông tin người dùng.
     * Chỉ admin mới có quyền truy cập.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, User $user)
    {
        // Kiểm tra xem người dùng có phải là admin không
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
        }

        // Admin không thể tự thay đổi thông tin của chính mình
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Bạn không thể tự thay đổi thông tin của chính mình.'], 403);
        }

        $validatedData = $request->validate([
            'expires_at' => 'nullable|date_format:Y-m-d',
        ]);

        $user->update($validatedData);

        return response()->json(['message' => 'Người dùng đã được cập nhật thành công.', 'user' => $user->fresh()]);
    }

    /**
     * Xóa hàng loạt người dùng.
     * Chỉ admin mới có quyền truy cập.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkDestroy(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
        }

        $validatedData = $request->validate([
            'userIds' => 'required|array',
            'userIds.*' => 'integer|exists:users,id',
        ]);

        $userIds = $validatedData['userIds'];

        // Admin không thể tự xóa chính mình
        if (in_array($request->user()->id, $userIds)) {
            return response()->json(['message' => 'Bạn không thể tự xóa chính mình trong một hành động hàng loạt.'], 403);
        }

        User::whereIn('id', $userIds)->delete();

        return response()->json(['message' => 'Các người dùng đã chọn đã được xóa thành công.']);
    }

    /**
     * Cập nhật trạng thái hàng loạt cho người dùng.
     * Chỉ admin mới có quyền truy cập.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkUpdateStatus(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
        }

        $validatedData = $request->validate([
            'userIds' => 'required|array',
            'userIds.*' => 'integer|exists:users,id',
            'status' => 'required|in:active,disabled',
        ]);

        $userIds = $validatedData['userIds'];
        $status = $validatedData['status'];

        // Admin không thể tự thay đổi trạng thái của chính mình
        if (in_array($request->user()->id, $userIds)) {
            return response()->json(['message' => 'Bạn không thể tự thay đổi trạng thái của chính mình trong một hành động hàng loạt.'], 403);
        }

        $updateData = ['status' => $status];
        if ($status === 'active') {
            // Tự động gia hạn ngày hết hạn khi kích hoạt lại hàng loạt
            $updateData['expires_at'] = now()->addMonths(3);
        }

        User::whereIn('id', $userIds)->update($updateData);

        return response()->json(['message' => 'Trạng thái của các người dùng đã chọn đã được cập nhật thành công.']);
    }

    /**
     * Cập nhật ngày hết hạn hàng loạt cho người dùng.
     * Chỉ admin mới có quyền truy cập.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkUpdateExpiry(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
        }

        $validatedData = $request->validate([
            'userIds' => 'required|array',
            'userIds.*' => 'integer|exists:users,id',
            'expires_at' => 'nullable|date_format:Y-m-d',
        ]);

        $userIds = $validatedData['userIds'];

        // Admin không thể tự thay đổi thông tin của chính mình
        if (in_array($request->user()->id, $userIds)) {
            return response()->json(['message' => 'Bạn không thể tự thay đổi ngày hết hạn của chính mình trong một hành động hàng loạt.'], 403);
        }

        User::whereIn('id', $userIds)->update(['expires_at' => $validatedData['expires_at']]);

        return response()->json(['message' => 'Ngày hết hạn của các người dùng đã chọn đã được cập nhật thành công.']);
    }
}