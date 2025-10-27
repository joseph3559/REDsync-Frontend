"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { registerRequest } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "qa_team"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      await registerRequest(formData.email, formData.password, formData.role, formData.name);
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-purple-100/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-slate-100/30 to-blue-100/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-4 group">
              <div className="relative">
                <Image src="/logo.png" alt="RED Lecithin logo" width={50} height={50} className="rounded-xl shadow-sm" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent"></div>
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">REDsync</span>
                <div className="text-sm text-slate-600 font-medium">RED Lecithin Internal Platform</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-900/5 to-green-900/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-60"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-green-200/50 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-green-500 text-white rounded-2xl shadow-lg mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">Registration Successful!</h1>
                  <p className="text-slate-600">Your account has been created and is pending approval by a super admin.</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-green-700">
                      <p className="font-semibold mb-1">What happens next?</p>
                      <ul className="list-disc list-inside space-y-1 text-green-600">
                        <li>A super admin will review your registration</li>
                        <li>You'll receive email notification once approved</li>
                        <li>You can then log in with your credentials</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-4 text-base font-semibold hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-purple-100/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-slate-100/30 to-blue-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-4 group">
            <div className="relative">
              <Image src="/logo.png" alt="RED Lecithin logo" width={50} height={50} className="rounded-xl shadow-sm" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent"></div>
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">REDsync</span>
              <div className="text-sm text-slate-600 font-medium">RED Lecithin Internal Platform</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 to-slate-900/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-60"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-2xl shadow-lg mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
                <p className="text-slate-600">Register for access to the REDsync platform</p>
              </div>

              <form className="space-y-5" onSubmit={onSubmit}>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white"
                    placeholder="your.email@redlecithin.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                  <input
                    type="text"
                    list="role-suggestions"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white"
                    placeholder="Enter your role or select from suggestions"
                    required
                  />
                  <datalist id="role-suggestions">
                    <option value="QA Team" />
                    <option value="Admin" />
                    <option value="Super Admin" />
                    <option value="Manager" />
                    <option value="Analyst" />
                    <option value="Technician" />
                  </datalist>
                  <p className="mt-1 text-xs text-slate-500">Select a suggested role or enter a custom one (subject to admin approval)</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white"
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-4 text-base font-semibold hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Create Account
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-200/50 text-center">
                <p className="text-sm text-slate-600 mb-3">Already have an account?</p>
                <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 transition-colors font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In Instead
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/5 border border-slate-200/50 rounded-full text-xs font-medium text-slate-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Your account will be reviewed by an administrator
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

