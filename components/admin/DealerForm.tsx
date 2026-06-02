"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { createDealerSchema, updateDealerSchema } from "@/lib/validations/dealer";
import type { CreateDealerFormData, UpdateDealerFormData } from "@/lib/validations/dealer";
import { AlertCircle, Loader2, Save, Eye, EyeOff } from "lucide-react";

interface DealerFormProps {
  dealer?: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    phone: string | null;
    address: string | null;
    isActive: boolean;
    isApproved: boolean;
  };
}

export function DealerForm({ dealer }: DealerFormProps) {
  const router = useRouter();
  const isEditing = !!dealer;
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  type FormData = CreateDealerFormData | UpdateDealerFormData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(isEditing ? updateDealerSchema : createDealerSchema) as never,
    defaultValues: dealer
      ? {
          name: dealer.name,
          email: dealer.email,
          company: dealer.company || "",
          phone: dealer.phone || "",
          address: dealer.address || "",
          isActive: dealer.isActive,
          isApproved: dealer.isApproved,
        }
      : { isApproved: true, isActive: true },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        isEditing ? `/api/dealers/${dealer.id}` : "/api/dealers",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || "Failed to save dealer");
        return;
      }

      router.push("/admin/dealers");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `form-input ${hasError ? "form-input-error" : ""}`;

  const err = errors as Record<string, { message?: string }>;

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title={isEditing ? "Edit Dealer" : "Add Dealer"}
        description={isEditing ? `Editing: ${dealer.name}` : "Create a new dealer account"}
        breadcrumb={[
          { label: "Admin" },
          { label: "Dealers", href: "/admin/dealers" },
          { label: isEditing ? "Edit" : "New" },
        ]}
      />

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-5">
        {/* Personal Info */}
        <div className="card-premium p-6">
          <h2 className="text-base font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dealer-name" className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
              <input id="dealer-name" type="text" placeholder="John Doe" className={inputClass(!!err.name)} {...register("name")} />
              {err.name && <p className="mt-1 text-xs text-red-600">{err.name.message}</p>}
            </div>
            <div>
              <label htmlFor="dealer-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
              <input id="dealer-email" type="email" placeholder="dealer@company.com" className={inputClass(!!err.email)} {...register("email")} />
              {err.email && <p className="mt-1 text-xs text-red-600">{err.email.message}</p>}
            </div>
            <div>
              <label htmlFor="dealer-company" className="block text-sm font-medium text-slate-700 mb-1.5">Company Name *</label>
              <input id="dealer-company" type="text" placeholder="EV Motors Pvt Ltd" className={inputClass(!!err.company)} {...register("company")} />
              {err.company && <p className="mt-1 text-xs text-red-600">{err.company.message}</p>}
            </div>
            <div>
              <label htmlFor="dealer-phone" className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number *</label>
              <input id="dealer-phone" type="tel" placeholder="9876543210" className={inputClass(!!err.phone)} {...register("phone")} />
              {err.phone && <p className="mt-1 text-xs text-red-600">{err.phone.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="dealer-address" className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
              <input id="dealer-address" type="text" placeholder="Full address (optional)" className={inputClass(!!err.address)} {...register("address")} />
            </div>
          </div>
        </div>

        {/* Password (create only) */}
        {!isEditing && (
          <div className="card-premium p-6">
            <h2 className="text-base font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100">
              Account Password
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dealer-password" className="block text-sm font-medium text-slate-700 mb-1.5">Password *</label>
                <div className="relative">
                  <input id="dealer-password" type={showPassword ? "text" : "password"} placeholder="Min 8 characters" className={`${inputClass(!!(err as Record<string, { message?: string }>).password)} pr-10`} {...register("password")} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {(err as Record<string, { message?: string }>).password && <p className="mt-1 text-xs text-red-600">{(err as Record<string, { message?: string }>).password?.message}</p>}
              </div>
              <div>
                <label htmlFor="dealer-confirm-pw" className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password *</label>
                <input id="dealer-confirm-pw" type="password" placeholder="Repeat password" className={inputClass(!!(err as Record<string, { message?: string }>).confirmPassword)} {...register("confirmPassword")} />
                {(err as Record<string, { message?: string }>).confirmPassword && <p className="mt-1 text-xs text-red-600">{(err as Record<string, { message?: string }>).confirmPassword?.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Account Settings */}
        <div className="card-premium p-6">
          <h2 className="text-base font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100">
            Account Settings
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input id="dealer-approved" type="checkbox" className="w-4 h-4 rounded text-blue-600" {...register("isApproved")} />
              <div>
                <span className="text-sm font-medium text-slate-700">Approved</span>
                <p className="text-xs text-slate-400">Allow this dealer to log in and view bikes</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input id="dealer-active" type="checkbox" className="w-4 h-4 rounded text-blue-600" {...register("isActive")} />
              <div>
                <span className="text-sm font-medium text-slate-700">Active</span>
                <p className="text-xs text-slate-400">Dealer account is enabled</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.push("/admin/dealers")} className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button id="dealer-form-submit" type="submit" disabled={isSubmitting} className="btn-ev inline-flex items-center gap-2 text-sm disabled:opacity-60">
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />{isEditing ? "Update Dealer" : "Create Dealer"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}

