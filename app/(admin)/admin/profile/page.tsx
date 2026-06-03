import type { Metadata } from "next";
import { ProfileForm } from "@/components/shared/ProfileForm";

export const metadata: Metadata = { title: "My Profile" };

export default function AdminProfilePage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
          <span>Admin</span><span>/</span>
          <span className="text-slate-600 font-medium">Profile</span>
        </nav>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account information and password</p>
      </div>
      <ProfileForm />
    </div>
  );
}
