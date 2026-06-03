"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Mail, Phone, Building2, MapPin, Lock,
  Save, AlertCircle, CheckCircle2, Loader2, Calendar, Shield
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const profileSchema = z.object({
  name:    z.string().min(2, "Name must be at least 2 characters"),
  phone:   z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword:     z.string().min(8, "Must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match", path: ["confirmPassword"],
});

type ProfileData  = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

interface UserProfile {
  id: string; name: string; email: string; phone: string | null;
  company: string | null; address: string | null; role: string; createdAt: string;
}

export function ProfileForm() {
  const [profile, setProfile]     = useState<UserProfile | null>(null);
  const [tab, setTab]             = useState<"profile" | "password">("profile");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const profileForm = useForm<ProfileData>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then((data: UserProfile) => {
      setProfile(data);
      profileForm.reset({ name: data.name, phone: data.phone, company: data.company, address: data.address });
    });
  }, [profileForm]);

  const saveProfile = async (data: ProfileData) => {
    setSavingProfile(true); setProfileMsg(null);
    const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const result = await res.json();
    setSavingProfile(false);
    if (res.ok) { setProfile(p => p ? { ...p, ...result } : p); setProfileMsg({ type: "success", text: "Profile updated successfully!" }); }
    else setProfileMsg({ type: "error", text: result.error || "Failed to update profile" });
  };

  const savePassword = async (data: PasswordData) => {
    setSavingPassword(true); setPasswordMsg(null);
    const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }) });
    const result = await res.json();
    setSavingPassword(false);
    if (res.ok) { passwordForm.reset(); setPasswordMsg({ type: "success", text: "Password changed successfully!" }); }
    else setPasswordMsg({ type: "error", text: result.error || "Failed to change password" });
  };

  const inputCls = (err?: boolean) =>
    `w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg outline-none transition-all bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${err ? "border-red-400" : "border-slate-200"}`;

  if (!profile) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {profile.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
            <p className="text-sm text-slate-500">{profile.email}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                <Shield className="w-3 h-3" />{profile.role}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="w-3 h-3" /> Joined {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {(["profile", "password"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-semibold capitalize border-b-2 transition-colors ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t === "profile" ? "Edit Profile" : "Change Password"}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <form onSubmit={profileForm.handleSubmit(saveProfile)} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          {profileMsg && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${profileMsg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
              {profileMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {profileMsg.text}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className={inputCls(!!profileForm.formState.errors.name)} {...profileForm.register("name")} /></div>
              {profileForm.formState.errors.name && <p className="mt-1 text-xs text-red-600">{profileForm.formState.errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email (read-only)</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input value={profile.email} disabled className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-100 rounded-lg bg-slate-50/50 text-slate-400 cursor-not-allowed" /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className={inputCls()} placeholder="9876543210" {...profileForm.register("phone")} /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Company</label>
              <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className={inputCls()} placeholder="Your company name" {...profileForm.register("company")} /></div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
              <div className="relative"><MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea rows={2} className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 resize-none"
                  placeholder="Your address" {...profileForm.register("address")} /></div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingProfile}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60">
              {savingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Profile</>}
            </button>
          </div>
        </form>
      )}

      {/* Password tab */}
      {tab === "password" && (
        <form onSubmit={passwordForm.handleSubmit(savePassword)} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          {passwordMsg && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${passwordMsg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
              {passwordMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {passwordMsg.text}
            </div>
          )}
          {[
            { id: "currentPassword", label: "Current Password", field: "currentPassword" as const },
            { id: "newPassword",     label: "New Password",     field: "newPassword"     as const },
            { id: "confirmPassword", label: "Confirm Password", field: "confirmPassword" as const },
          ].map(({ id, label, field }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id={id} type="password" className={inputCls(!!passwordForm.formState.errors[field])} {...passwordForm.register(field)} /></div>
              {passwordForm.formState.errors[field] && <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors[field]?.message}</p>}
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingPassword}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60">
              {savingPassword ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : <><Lock className="w-4 h-4" /> Change Password</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
