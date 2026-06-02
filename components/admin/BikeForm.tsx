"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { bikeSchema, type BikeFormData } from "@/lib/validations/bike";
import { AlertCircle, Loader2, Save } from "lucide-react";

interface ExistingImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
}

interface BikeFormProps {
  bike?: {
    id: string;
    name: string;
    brand: string;
    model: string;
    batteryCapacity: string;
    range: string;
    topSpeed: string;
    chargingTime: string;
    price: string;
    description: string;
    isAvailable: boolean;
    images: ExistingImage[];
  };
}

export function BikeForm({ bike }: BikeFormProps) {
  const router = useRouter();
  const isEditing = !!bike;
  const [images, setImages] = useState<ExistingImage[]>(bike?.images || []);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BikeFormData>({
    resolver: zodResolver(bikeSchema),
    defaultValues: bike || { isAvailable: true },
  });

  const handleImagesChange = (newImages: ExistingImage[]) => {
    // Track removed images
    const currentIds = newImages.map((img) => img.publicId);
    const removed = images.filter((img) => !currentIds.includes(img.publicId));
    setRemovedImageIds((prev) => [...prev, ...removed.map((img) => img.publicId)]);
    setImages(newImages);
  };

  const onSubmit = async (data: BikeFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...data,
        images,
        ...(isEditing && { removedImageIds }),
      };

      const response = await fetch(
        isEditing ? `/api/bikes/${bike.id}` : "/api/bikes",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || "Failed to save bike");
        return;
      }

      router.push("/admin/bikes");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `form-input ${hasError ? "form-input-error" : ""}`;

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title={isEditing ? "Edit Bike" : "Add New Bike"}
        description={isEditing ? `Editing: ${bike.name}` : "Add a new EV bike to your inventory"}
        breadcrumb={[
          { label: "Admin" },
          { label: "Bikes", href: "/admin/bikes" },
          { label: isEditing ? "Edit" : "New" },
        ]}
      />

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic Info */}
        <div className="card-premium p-6">
          <h2 className="text-base font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bike-name" className="block text-sm font-medium text-slate-700 mb-1.5">Bike Name *</label>
              <input id="bike-name" type="text" placeholder="e.g. Thunder 5000" className={inputClass(!!errors.name)} {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="bike-brand" className="block text-sm font-medium text-slate-700 mb-1.5">Brand *</label>
              <input id="bike-brand" type="text" placeholder="e.g. Ather, Ola, Revolt" className={inputClass(!!errors.brand)} {...register("brand")} />
              {errors.brand && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.brand.message}</p>}
            </div>
            <div>
              <label htmlFor="bike-model" className="block text-sm font-medium text-slate-700 mb-1.5">Model *</label>
              <input id="bike-model" type="text" placeholder="e.g. 450X, S1 Pro" className={inputClass(!!errors.model)} {...register("model")} />
              {errors.model && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.model.message}</p>}
            </div>
            <div>
              <label htmlFor="bike-price" className="block text-sm font-medium text-slate-700 mb-1.5">Price (₹) *</label>
              <input id="bike-price" type="number" step="0.01" placeholder="e.g. 145000" className={inputClass(!!errors.price)} {...register("price")} />
              {errors.price && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.price.message}</p>}
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="card-premium p-6">
          <h2 className="text-base font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100">
            Technical Specifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div>
              <label htmlFor="bike-battery" className="block text-sm font-medium text-slate-700 mb-1.5">Battery Capacity *</label>
              <input id="bike-battery" type="text" placeholder="e.g. 3.7 kWh" className={inputClass(!!errors.batteryCapacity)} {...register("batteryCapacity")} />
              {errors.batteryCapacity && <p className="mt-1 text-xs text-red-600">{errors.batteryCapacity.message}</p>}
            </div>
            <div>
              <label htmlFor="bike-range" className="block text-sm font-medium text-slate-700 mb-1.5">Range *</label>
              <input id="bike-range" type="text" placeholder="e.g. 146 km" className={inputClass(!!errors.range)} {...register("range")} />
              {errors.range && <p className="mt-1 text-xs text-red-600">{errors.range.message}</p>}
            </div>
            <div>
              <label htmlFor="bike-speed" className="block text-sm font-medium text-slate-700 mb-1.5">Top Speed *</label>
              <input id="bike-speed" type="text" placeholder="e.g. 90 km/h" className={inputClass(!!errors.topSpeed)} {...register("topSpeed")} />
              {errors.topSpeed && <p className="mt-1 text-xs text-red-600">{errors.topSpeed.message}</p>}
            </div>
            <div>
              <label htmlFor="bike-charging" className="block text-sm font-medium text-slate-700 mb-1.5">Charging Time *</label>
              <input id="bike-charging" type="text" placeholder="e.g. 5 hrs (0-80%)" className={inputClass(!!errors.chargingTime)} {...register("chargingTime")} />
              {errors.chargingTime && <p className="mt-1 text-xs text-red-600">{errors.chargingTime.message}</p>}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card-premium p-6">
          <h2 className="text-base font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100">
            Description
          </h2>
          <div>
            <label htmlFor="bike-description" className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
            <textarea
              id="bike-description"
              rows={5}
              placeholder="Describe the bike's features, highlights, and key selling points..."
              className={`form-input resize-none ${errors.description ? "form-input-error" : ""}`}
              {...register("description")}
            />
            {errors.description && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description.message}</p>}
          </div>
        </div>

        {/* Images */}
        <div className="card-premium p-6">
          <h2 className="text-base font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100">
            Images
          </h2>
          <ImageUpload value={images} onChange={handleImagesChange} maxImages={8} />
        </div>

        {/* Availability */}
        <div className="card-premium p-6">
          <h2 className="text-base font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100">
            Availability
          </h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              id="bike-available"
              type="checkbox"
              className="w-4 h-4 rounded text-ev-blue focus:ring-ev-blue"
              {...register("isAvailable")}
            />
            <span className="text-sm text-slate-700">
              Mark this bike as available for dealers to view
            </span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.push("/admin/bikes")}
            className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            id="bike-form-submit"
            type="submit"
            disabled={isSubmitting}
            className="btn-ev inline-flex items-center gap-2 text-sm disabled:opacity-60"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
            ) : (
              <><Save className="w-4 h-4" />{isEditing ? "Update Bike" : "Add Bike"}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
