"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUserShield, FaSignInAlt, FaEye, FaEyeSlash } from "react-icons/fa";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/admin/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Check credentials or role.");
        return;
      }

      const adminData = { name: "Admin", email: data.email, role: "admin" };

      localStorage.setItem("user", JSON.stringify(adminData));
      localStorage.setItem("token", data.token);

      router.push("/dashboard/admin");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-blue-100 p-6">
      {/* Bigger login box */}
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-md p-12 rounded-3xl shadow-2xl border border-blue-100 transition-all hover:shadow-blue-200">
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center transition-transform hover:scale-[1.02]">
          <FaUserShield className="text-blue-600 text-7xl mb-4 animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            ADMIN ACCESS
          </h1>
          <p className="text-blue-500 mt-3 text-base md:text-lg tracking-wide">
            Secure Issue Management Portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-100 text-red-700 border border-red-400 rounded-lg text-sm animate-shake">
              {error}
            </div>
          )}

          <div className="group">
            <label className="block text-base font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-gray-800 placeholder-gray-400 text-lg group-hover:border-blue-400"
              placeholder="Enter admin email"
            />
          </div>

          <div className="relative group">
            <label className="block text-base font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-gray-800 placeholder-gray-400 text-lg group-hover:border-blue-400"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[46px] text-gray-500 hover:text-blue-500 transition"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Authenticating...
              </span>
            ) : (
              <>
                Login Securely
                <FaSignInAlt />
              </>
            )}
          </button>

          <div className="text-center text-sm mt-4">
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-all"
            >
              ← Back to Citizen Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
