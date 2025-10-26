import { useState } from "react";
import { useLocation } from "wouter";
import { FaEnvelope } from "react-icons/fa";
import { api } from "../lib/api";
import "../css/Login.css"; // Tái sử dụng CSS từ trang Login

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.forgotPassword({ email });
      setMessage(
        "If an account with that email exists, a password reset link has been sent."
      );
    } catch (err: any) {
      setError(err?.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-form-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-title">
            <FaEnvelope style={{ marginRight: 8 }} />
            Forgot Password
          </div>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'center' }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <label className="login-label" htmlFor="email">
            Email:
          </label>
          <input
            id="email"
            className="login-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          {message && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
          {error && <div className="login-warning">{error}</div>}

          <button className="login-btn" type="submit">
            Send Reset Link
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span
              style={{ fontSize: "13px", color: "#007bff", cursor: "pointer" }}
              onClick={() => setLocation("/login")}
            >
              Back to Sign in
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;