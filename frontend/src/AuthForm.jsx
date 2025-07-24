import React, { useState } from "react";
import { API_BASE_URL } from './config';

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login"); // or "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const endpoint = mode === "login" ? "/login" : "/register";
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "Error");
        return;
      }
      if (mode === "login" && data.access_token) {
        localStorage.setItem("token", data.access_token);
        onAuth && onAuth(data.access_token);
      } else if (mode === "register") {
        setMode("login");
        setError("Registered! Please log in.");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div style={{
      maxWidth: 320,
      margin: "40px auto",
      padding: 24,
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 12,
      boxShadow: 'none',
    }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button type="submit" style={{
          padding: 10,
          borderRadius: 6,
          background: 'rgba(255,255,255,0.05)',
          color: '#222',
          border: '0.5px solid #222',
          fontWeight: 500,
          transition: 'background 0.2s, color 0.2s, border 0.2s',
          boxShadow: 'none',
          cursor: 'pointer',
        }}
        onMouseOver={e => {
          e.currentTarget.style.background = '#222';
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.border = '0.5px solid #222';
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.color = '#222';
          e.currentTarget.style.border = '0.5px solid #222';
        }}
        >
          {mode === "login" ? "Log In" : "Register"}
        </button>
        {error && <div style={{ color: "red", textAlign: "center" }}>{error}</div>}
      </form>
      <div style={{ textAlign: "center", marginTop: 10 }}>
        {mode === "login" ? (
          <span style={{ color: '#888' }}>
            New?{" "}
            <button type="button" onClick={() => setMode("register")}
              style={{ background: "none", border: "none", color: "#222", textDecoration: "underline", cursor: "pointer" }}>
              Register
            </button>
          </span>
        ) : (
          <span style={{ color: '#888' }}>
            Already have an account?{" "}
            <button type="button" onClick={() => setMode("login")}
              style={{ background: "none", border: "none", color: "#222", textDecoration: "underline", cursor: "pointer" }}>
              Log In
            </button>
          </span>
        )}
      </div>
    </div>
  );
} 