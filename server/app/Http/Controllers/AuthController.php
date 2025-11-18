<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Auth\Events\PasswordReset;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'string', PasswordRule::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        $user = User::create([
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'user', // Mặc định là user
            'status' => 'active', // Mặc định là active
            'expires_at' => now()->addMonths(3),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Incorrect login information.'], 401);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // --- BẮT ĐẦU THAY ĐỔI QUAN TRỌNG ---
        // Kiểm tra trạng thái của người dùng
        if ($user->status === 'disabled') {
            // Hủy tất cả token của user này để đảm bảo họ không thể truy cập
            $user->tokens()->delete();
            Auth::logout(); // Đăng xuất người dùng

            return response()->json([
                'message' => 'Your account has been disabled. Please contact your administrator for assistance.'
            ], 403); // 403 Forbidden là mã trạng thái phù hợp
        }

        // Kiểm tra ngày hết hạn
        if ($user->expires_at && $user->expires_at->isPast()) {
            // Nếu đã hết hạn, cập nhật trạng thái thành 'disabled'
            $user->status = 'disabled';
            $user->save();

            // Hủy token và đăng xuất
            $user->tokens()->delete();
            Auth::logout();

            return response()->json([
                'message' => 'Your account has expired. Please contact your administrator for assistance.'
            ], 403);
        }

        // --- KẾT THÚC THAY ĐỔI QUAN TRỌNG ---

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Log out successfully.']);
    }

    public function user(Request $request)
    {
        return $request->user();
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => ['required', 'confirmed', PasswordRule::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Old password is incorrect.'], 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['success' => true, 'message' => 'Password has been changed successfully.']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        // Gửi link reset mật khẩu qua email
        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)]);
        }

        // Nếu email không tồn tại, Laravel sẽ trả về 'passwords.user'
        // Trả về lỗi để client xử lý
        return response()->json([
            'message' => __($status),
            'error_code' => $status
        ], 400);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', PasswordRule::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        // Thử reset mật khẩu
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->save();

                // Vô hiệu hóa tất cả các token cũ để đăng xuất khỏi các thiết bị khác
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)]);
        }

        // Nếu token không hợp lệ hoặc đã hết hạn, trả về lỗi
        return response()->json([
            'message' => __($status),
            'error_code' => $status
        ], 400);
    }




    // Các phương thức khác như logoutAll, revokeToken có thể được thêm vào đây nếu cần.
}
