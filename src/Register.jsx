import React, { useState } from "react";
import { Link } from "react-router-dom";
import '../src/components/ui/login/Login.css'

const BACKEND_URL = "http://localhost:5000"; // same as Login / ChatPage

const Register = ({ onRegister }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState(""); // optional
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // -------- VALIDATIONS --------
  const validateName = (value) => {
    if (!value.trim()) return "Name is required";
    if (value.trim().length < 2) return "Name must be at least 2 characters";
    return "";
  };

  const validateEmail = (value) => {
    if (!value.trim()) return "Email is required";
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value.trim())) return "Enter a valid email address";
    return "";
  };

  const validatePassword = (value) => {
    if (!value.trim()) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    return "";
  };

  const validateConfirmPassword = (value) => {
    if (!value.trim()) return "Please confirm your password";
    if (value !== password) return "Passwords do not match";
    return "";
  };

  const nameError = touched.name ? validateName(name) : "";
  const emailError = touched.email ? validateEmail(email) : "";
  const passwordError = touched.password ? validatePassword(password) : "";
  const confirmPasswordError = touched.confirmPassword
    ? validateConfirmPassword(confirmPassword)
    : "";

  const formValid =
    !validateName(name) &&
    !validateEmail(email) &&
    !validatePassword(password) &&
    !validateConfirmPassword(confirmPassword);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const submit = async (e) => {
    e.preventDefault();
    // mark all touched for final validation
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    setServerError("");

    if (!formValid) return;

    try {
      setLoading(true);

      const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          // number is optional; add to backend later if needed
          phone: number,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.user?.email) {
        localStorage.setItem("userEmail", data.user.email);
      }

      if (onRegister) {
        onRegister(data.user?.email || email || "newuser@example.com");
      }
    } catch (err) {
      console.error("Register error:", err);
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left brand panel (same as Login) */}
      <div className="auth-left-panel">
        <div className="brand-block">
          <div className="brand-logo">SD</div>
          <h1>SecureDoc AI</h1>
          <p>Create your account and start securely managing your documents with AI.</p>
        </div>
      </div>

      {/* Right card */}
      <div className="auth-container">
        <div className="auth-card">
          <div className="logo-section">
            <h2 className="auth-title">Create your account</h2>
            <p className="auth-subtitle">It only takes a few seconds to get started.</p>
          </div>

          {serverError && (
            <div className="auth-error-box">
              {serverError}
            </div>
          )}

          <form className="auth-form" onSubmit={submit} noValidate>
            {/* Name */}
            <div className="form-group">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                className={`input-box ${nameError ? "input-error" : ""}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur("name")}
                placeholder="Full name"
                required
              />
              {nameError && <div className="field-error">{nameError}</div>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
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

            {/* Phone (optional) */}
            <div className="form-group">
              <label htmlFor="reg-phone">Phone Number (optional)</label>
              <input
                id="reg-phone"
                className="input-box"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Phone number"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                className={`input-box ${passwordError ? "input-error" : ""}`}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                required
              />
              {passwordError && (
                <div className="field-error">{passwordError}</div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="reg-confirm">Confirm Password</label>
              <input
                id="reg-confirm"
                className={`input-box ${confirmPasswordError ? "input-error" : ""}`}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
              />
              {confirmPasswordError && (
                <div className="field-error">{confirmPasswordError}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !formValid}
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
