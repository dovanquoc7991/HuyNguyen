import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FaKey } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import { api } from "../lib/api";
import "../css/Login.css"; // Tái sử dụng CSS từ trang Login

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Lấy token và email từ query string của URL
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(emailParam);
    } else {
      setError("Invalid or expired reset link. Please try again.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    if (!token || !email) {
      setError("Missing token or email. The link might be invalid.");
      return;
    }

    try {
      await api.resetPassword({ token, email, password });
      setMessage("Your password has been reset successfully! Redirecting to login...");
      setTimeout(() => {
        setLocation("/login");
      }, 3000); // Chuyển hướng sau 3 giây
    } catch (err: any) {
      setError(err?.message || "Failed to reset password. The link may have expired.");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-form-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-title">
            <FaKey style={{ marginRight: 8 }} />
            Reset Password
          </div>

          {message && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
          {error && <div className="login-warning">{error}</div>}

          {!message && ( // Ẩn form sau khi thành công
            <>
              <label className="login-label" htmlFor="password">
                New Password:
              </label>
              <div className="relative">
                <input
                  id="password"
                  className="login-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: "40px" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <label className="login-label" htmlFor="password_confirmation">
                Confirm New Password:
              </label>
              <div className="relative">
                <input
                  id="password_confirmation"
                  className="login-input"
                  type={showPasswordConfirmation ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  style={{ paddingRight: "40px" }}
                />
                <button type="button" onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                  {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button className="login-btn" type="submit" disabled={!token || !email}>
                Reset Password
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;