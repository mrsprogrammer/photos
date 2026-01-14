"use client";

import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("Password is required");
      return false;
    }
    if (value.length < 8 || value.length > 32) {
      setPasswordError("Password must be between 8 and 32 characters");
      return false;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/.test(value)) {
      setPasswordError("Password is too weak (need letters and numbers)");
      return false;
    }
    setPasswordError("");
    return true;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);

    if (!emailValid || !passwordValid) {
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      setSuccess(true);
      // Redirect after 2.5 seconds to let user see success message
      setTimeout(() => {
        router.replace("/signin");
      }, 2500);
    } catch (err: any) {
      setError(err?.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Sign up — Photos</title>
        <meta name="description" content="Create an account" />
      </Head>

      <div className="min-h-screen bg-white flex items-start justify-center pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="text-center">
            <img src="/logo.png" alt="Photos Logo" className="h-44 w-auto mx-auto rounded-lg" />
          </div>

          {/* Main Form Card */}
          <form className="bg-white shadow-xl rounded-2xl p-8 border border-black border-opacity-10" onSubmit={handleSubmit} noValidate>
            {/* Success Alert */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                <svg className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-800">Account created successfully!</p>
                  <p className="text-sm text-green-700">Redirecting to sign in page...</p>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2 tracking-tight">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                onBlur={() => validateEmail(email)}
                className={`block w-full px-4 py-2.5 rounded-lg border-2 transition-all focus:outline-none ${emailError ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50" : "border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-200"}`}
                placeholder="you@example.com"
              />
              {emailError && <p className="mt-1 text-sm font-medium text-red-600">{emailError}</p>}
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-2 tracking-tight">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                  }}
                  onBlur={() => validatePassword(password)}
                  className={`block w-full px-4 py-2.5 rounded-lg border-2 transition-all focus:outline-none ${passwordError ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50" : "border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-200"}`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-3.5-10-8 1-2.5 3-4.5 5.4-6M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && <p className="mt-1 text-sm font-medium text-red-600">{passwordError}</p>}
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="w-full py-2.5 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
            <p className="text-gray-700 mt-6 text-center">
              Already have an account?{" "}
              <Link className="font-semibold text-black hover:text-gray-700 transition-colors" href="/signin">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
