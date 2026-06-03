"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Zap, AlertCircle, Loader2 } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true); setError(null);
    try {
      const result = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      if (result?.error) { setError("Invalid email or password"); return; }
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      router.push(session?.user?.role === "ADMIN" ? "/admin/dashboard" : "/dealer/dashboard");
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">EV Dealer Portal</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 bg-blue-600 w-full" />
          <div className="p-7">
            <h1 className="text-xl font-bold text-slate-900 mb-1">Welcome back</h1>
            <p className="text-sm text-slate-400 mb-6">Sign in to your account to continue</p>

            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-slide-up">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input id="email" type="email" autoComplete="email" placeholder="you@example.com"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition-all bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.email ? "border-red-400" : "border-slate-200"}`}
                  {...register("email")} />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input id="password" type={showPw ? "text" : "password"} autoComplete="current-password" placeholder="••••••••"
                    className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg outline-none transition-all bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.password ? "border-red-400" : "border-slate-200"}`}
                    {...register("password")} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <button id="login-submit" type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors mt-1">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : <><Zap className="w-4 h-4" /> Sign In</>}
              </button>
            </form>

            <div className="mt-6 space-y-2 text-center">
              <p className="text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-blue-600 font-semibold hover:underline">Register as Dealer</Link>
              </p>
              <p className="text-xs text-slate-400">
                First time?{" "}
                <Link href="/admin-setup" className="text-slate-500 hover:text-blue-600 transition-colors">Admin Setup</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {[
            { title: "Admin Portal", desc: "Manage bikes & dealers" },
            { title: "Dealer Portal", desc: "Browse EV inventory" },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-center">
              <p className="text-xs font-semibold text-slate-300">{title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

