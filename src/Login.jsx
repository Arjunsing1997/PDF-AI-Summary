import React, { useState } from "react";
import { Link } from "react-router-dom";
import '../src/components/ui/login/Login.css'

const BACKEND_URL = "http://localhost:5000"; // same as ChatPage

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // ---------- VALIDATION HELPERS ----------
  const validateEmail = (value) => {
    if (!value.trim()) return "Email is required";
    // simple email pattern
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value.trim())) return "Enter a valid email address";
    return "";
  };

  const validatePassword = (value) => {
    if (!value.trim()) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const emailError = touched.email ? validateEmail(email) : "";
  const passwordError = touched.password ? validatePassword(password) : "";

  const formValid =
    !validateEmail(email) &&
    !validatePassword(password);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setServerError("");

    // run final validation before calling backend
    if (!formValid) return;

    try {
      setLoading(true);

      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.user?.email) {
        localStorage.setItem("userEmail", data.user.email);
      }

      if (onLogin) {
        onLogin(data.user?.email || email);
      }
    } catch (err) {
      console.error("Login error:", err);
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left-panel">
        <div className="brand-block">
          <div className="brand-logo">SD</div>
          <h1>SecureDoc AI</h1>
          <p>Securely store, search and share your important documents with AI.</p>
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="logo-section">
            <h2 className="auth-title">Welcome back 👋</h2>
            <p className="auth-subtitle">Login to access your secure workspace.</p>
          </div>

          {serverError && (
            <div className="auth-error-box">
              {serverError}
            </div>
          )}

          <form className="auth-form" onSubmit={submit} noValidate>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                className={`input-box ${emailError ? "input-error" : ""}`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              {emailError && <div className="field-error">{emailError}</div>}
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot Password?
                </Link>
              </div>
              <input
                id="login-password"
                className={`input-box ${passwordError ? "input-error" : ""}`}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              {passwordError && (
                <div className="field-error">{passwordError}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !formValid}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="auth-footer">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
