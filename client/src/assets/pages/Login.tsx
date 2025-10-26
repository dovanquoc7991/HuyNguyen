import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { FaSignInAlt } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import "../css/Login.css";
import { useAuth } from "../hooks/use-auth"; // Giả định useAuth có login() method
import { queryClient } from "../lib/queryClient";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [warning, setWarning] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();

  const { login } = useAuth(); // Sử dụng hook useAuth

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWarning("");
    try {
      const res = await login(username, password, rememberMe); // login từ useAuth
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["me"] });
        setLocation("/home"); // navigate thành công
      } else {
        setWarning(res.message || "Username or password is incorrect.");
      }
    } catch (error: any) {
      setWarning(error?.message || "Login failed");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-form-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-title">
            <FaSignInAlt style={{ marginRight: 8 }} />
            Sign in
          </div>

          <label className="login-label" htmlFor="username">
            Username:
          </label>
          <input
            id="username"
            className="login-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          <label className="login-label" htmlFor="password">
            Password:
          </label>
          {/* Wrapper cho input + icon */}
          <div className="relative">
            <input
              id="password"
              className="login-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={{ paddingRight: "40px" }} // chừa khoảng trống bên phải
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
            <span
              style={{
                fontSize: "13px",
                color: "#007bff",
                cursor: "pointer",
                textDecoration: "none"
              }}
              onClick={() => setLocation("/forgot-password")}
            >
              Forgot password?
            </span>
          </div>

          <div className="login-label-1" style={{ marginBottom: "9px" }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" style={{ marginLeft: "9px" }}>
              Remember me
            </label>
          </div>

          {warning && <div className="login-warning">{warning}</div>}

          <button className="login-btn" type="submit">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
