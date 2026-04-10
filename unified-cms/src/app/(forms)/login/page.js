"use client";

import { useState , useEffect} from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginToken = localStorage.getItem("token");
  const router = useRouter();

  const login = async () => {
    setError("");
    if (!email || !password) {
      setError("Email and password required");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }
      if (data.user) {
        localStorage.setItem("adminId", data.user.id);
        localStorage.setItem("adminEmail", data.user.email);
        localStorage.setItem("role", data.user.role);
      }
      setStep("otp");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setError("");
    if (!otp) {
      setError("Enter OTP");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid OTP");
        return;
      }
      localStorage.setItem("token", data.accessToken);
      if (data.user) {
        localStorage.setItem("adminId", data.user.id);
        localStorage.setItem("adminEmail", data.user.email);
        localStorage.setItem("role", data.user.role);
      }
      router.replace("/cso/blogs");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.replace("/cso/blogs");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8 transition-all duration-300">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
          {step === "login" ? "Admin Login" : "Verify OTP"}
        </h2>
        {step === "login" ? (
          <p className="text-center text-gray-500 text-sm mb-6">
            Enter your credentials to access dashboard
          </p>
        ) : (
          <p className="text-center text-gray-500 text-sm mb-6">
            We've sent a 6-digit code to{" "}
            <span className="font-medium text-indigo-600">{email}</span>
          </p>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        {step === "login" ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div
                  className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <button
              onClick={login}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold 
              hover:bg-indigo-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Login"}
            </button>

            {/* Forgot password link */}
            <div className="mt-4 text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Forgot password?
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
              <ShieldCheck
                className="text-blue-600 flex-shrink-0 mt-0.5"
                size={18}
              />
              <p className="text-sm text-blue-800">
                A 6-digit verification code has been sent to your email address.
                It will expire in 5 minutes.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter OTP
              </label>
              <input
                type="text"
                placeholder="000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-center text-2xl tracking-widest"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                }
              />
            </div>

            <button
              onClick={verify}
              disabled={loading || otp.length !== 6}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold 
              hover:bg-green-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={login}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Didn't receive code? Resend OTP
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
