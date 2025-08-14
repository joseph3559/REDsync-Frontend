"use client";
import { useState } from "react";
import { storeToken } from "@/lib/auth";

export default function TestLogin() {
  const [email, setEmail] = useState("test2@example.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      storeToken(data.token);
      setMessage("✅ Login successful! Dashboard will refresh automatically.");
      
      // Refresh the page to load user data
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setMessage("❌ Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-yellow-800 mb-3">🔐 Quick Dashboard Login</h3>
      <p className="text-sm text-yellow-700 mb-4">Login to see real dashboard statistics</p>
      <div className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Logging in..." : "Login to Dashboard"}
        </button>
      </div>
      {message && <p className="text-sm text-yellow-700 mt-3 text-center">{message}</p>}
    </div>
  );
}