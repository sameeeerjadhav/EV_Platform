"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Shield, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { adminRegisterSchema, type AdminRegisterFormData } from "@/lib/validations/auth";

export default function AdminSetupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AdminRegisterFormData>({
    resolver: zodResolver(adminRegisterSchema),
  });

  const onSubmit = async (data: AdminRegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) { setError(result.error || "Setup failed."); return; }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-65px)] p-4">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-10 text-center">
            <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Admin Created!</h1>
            <p className="text-slate-500 text-sm">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-65px)] p-4 py-8">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Blue accent bar */}
          <div className="h-1 bg-brand w-full" />

          <div className="p-7">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">Admin Setup</h1>
                <p className="text-slate-500 text-xs mt-0.5">One-time admin account creation</p>
              </div>
            </div>

            {/* Warning notice */}
            <div className="p-3 mb-5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs leading-relaxed">
              ⚠️ This page is only accessible if no admin account exists yet. It will be disabled after setup.
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-slide-up">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="admin-name" className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input id="admin-name" type="text" placeholder="Admin Name"
                  className={`form-input ${errors.name ? "form-input-error" : ""}`}
                  {...register("name")} />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input id="admin-email" type="email" placeholder="admin@example.com"
                  className={`form-input ${errors.email ? "form-input-error" : ""}`}
                  {...register("email")} />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              {/* Setup Key */}
              <div>
                <label htmlFor="admin-setup-key" className="block text-sm font-medium text-slate-700 mb-1.5">Setup Key</label>
                <input id="admin-setup-key" type="password" placeholder="Enter the ADMIN_SETUP_KEY from .env"
                  className={`form-input ${errors.setupKey ? "form-input-error" : ""}`}
                  {...register("setupKey")} />
                {errors.setupKey && <p className="mt-1 text-xs text-red-600">{errors.setupKey.message}</p>}
                <p className="mt-1 text-xs text-slate-400">Set ADMIN_SETUP_KEY in your .env file</p>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input id="admin-password" type={showPassword ? "text" : "password"} placeholder="Strong password"
                    className={`form-input pr-10 ${errors.password ? "form-input-error" : ""}`}
                    {...register("password")} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="admin-confirm" className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <input id="admin-confirm" type="password" placeholder="Repeat password"
                  className={`form-input ${errors.confirmPassword ? "form-input-error" : ""}`}
                  {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
              </div>

              <button id="admin-setup-submit" type="submit" disabled={isLoading} className="btn-ev w-full mt-1">
                {isLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Admin...</>
                  : <><Shield className="w-4 h-4" /> Create Admin Account</>}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              <Link href="/login" className="text-brand font-medium hover:underline">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
