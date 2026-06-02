"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  Eye, EyeOff, Zap, AlertCircle, Loader2, CheckCircle2,
  User, Building2, Phone, Mail, Lock
} from "lucide-react";
import { dealerRegisterSchema, type DealerRegisterFormData } from "@/lib/validations/auth";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<DealerRegisterFormData>({
    resolver: zodResolver(dealerRegisterSchema),
  });

  const onSubmit = async (data: DealerRegisterFormData) => {
    setIsLoading(true); setError(null);
    try {
      const res = await fetch("/api/dealers/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) { setError(result.error || "Registration failed."); return; }
      setSuccess(true);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setIsLoading(false); }
  };

  /* ── Success state ── */
  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm animate-fade-in text-center">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-10">
            <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Your dealer account has been submitted. An admin will review and approve it before you can log in.
            </p>
            <Link href="/login" className="btn-ev inline-flex items-center gap-2">
              <Zap className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Register form ── */
  const field = (hasError: boolean) =>
    `w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg outline-none transition-all bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${hasError ? "border-red-400" : "border-slate-200"}`;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-sm animate-fade-in">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-7">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-base">EV Dealer Portal</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 bg-blue-600 w-full" />
          <div className="p-7">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">Dealer Registration</h1>
                <p className="text-slate-400 text-xs mt-0.5">Pending admin approval after sign up</p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-slide-up">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">

              {/* Name */}
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input id="reg-name" type="text" placeholder="John Doe" className={field(!!errors.name)} {...register("name")} />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              {/* Company */}
              <div>
                <label htmlFor="reg-company" className="block text-sm font-medium text-slate-700 mb-1">Company / Dealership</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input id="reg-company" type="text" placeholder="EV Motors Pvt Ltd" className={field(!!errors.company)} {...register("company")} />
                </div>
                {errors.company && <p className="mt-1 text-xs text-red-600">{errors.company.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="reg-phone" className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input id="reg-phone" type="tel" placeholder="9876543210" className={field(!!errors.phone)} {...register("phone")} />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input id="reg-email" type="email" placeholder="you@company.com" className={field(!!errors.email)} {...register("email")} />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input id="reg-password" type={showPassword ? "text" : "password"} placeholder="Min 8 chars"
                    className={field(!!errors.password) + " pr-10"} {...register("password")} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input id="reg-confirm" type={showConfirm ? "text" : "password"} placeholder="Repeat password"
                    className={field(!!errors.confirmPassword) + " pr-10"} {...register("confirmPassword")} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
              </div>

              <button id="register-submit" type="submit" disabled={isLoading}
                className="btn-ev w-full mt-1 disabled:opacity-60">
                {isLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                  : <><Zap className="w-4 h-4" /> Submit Application</>}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
