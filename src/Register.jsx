import React, { useState } from "react";
import { Link } from "react-router-dom";

const BACKEND_URL = "http://localhost:5000"; // same as Login / ChatPage

const Register = ({ onRegister }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState(""); // not used in backend, just UI
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // Call backend register API
      const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          // number is not used by your current backend, but you can add it later
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      // Save JWT so user is effectively logged in after signup
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.user?.email) {
        localStorage.setItem("userEmail", data.user.email);
      }

      // Notify parent that registration succeeded
      if (onRegister) {
        onRegister(data.user?.email || email || "newuser@example.com");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-section">
          <div className="app-logo" />
          <h2>Create Account</h2>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              className="input-box"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              className="input-box"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              className="input-box"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Phone number"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              className="input-box"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              minLength={8}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              className="input-box"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
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
  );
};

export default Register;
