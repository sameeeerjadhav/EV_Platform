"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImagePlus, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
}

interface ImageUploadProps {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export function ImageUpload({
  value,
  onChange,
  maxImages = 8,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (value.length >= maxImages) return;

    const filesToUpload = Array.from(files).slice(0, maxImages - value.length);
    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");
        return response.json() as Promise<{ url: string; publicId: string }>;
      });

      const results = await Promise.all(uploadPromises);
      const newImages: UploadedImage[] = results.map((r, i) => ({
        url: r.url,
        publicId: r.publicId,
        isPrimary: value.length === 0 && i === 0,
      }));

      onChange([...value, ...newImages]);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (publicId: string) => {
    const updated = value.filter((img) => img.publicId !== publicId);
    // If removed image was primary, make first one primary
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const setPrimary = (publicId: string) => {
    onChange(
      value.map((img) => ({ ...img, isPrimary: img.publicId === publicId }))
    );
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {value.length < maxImages && (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
            dragOver
              ? "border-ev-blue bg-ev-blue/5"
              : "border-slate-200 hover:border-ev-blue/50 hover:bg-slate-50"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            id="image-upload-input"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-ev-blue animate-spin" />
              <p className="text-sm text-slate-500">Uploading to Cloudinary...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-ev-blue/10 flex items-center justify-center">
                <ImagePlus className="w-6 h-6 text-ev-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Drop images here or{" "}
                  <span className="text-ev-blue">click to browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG, WebP up to 10MB each • Max {maxImages} images
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {value.map((image) => (
            <div
              key={image.publicId}
              className="relative group rounded-xl overflow-hidden border-2 border-slate-200 aspect-square"
              style={{ borderColor: image.isPrimary ? "#0ea5e9" : undefined }}
            >
              <Image
                src={image.url}
                alt="Bike image"
                fill
                className="object-cover"
                sizes="150px"
              />

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!image.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(image.publicId)}
                    className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white"
                    title="Set as primary"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(image.publicId)}
                  className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>

              {/* Primary badge */}
              {image.isPrimary && (
                <div className="absolute top-1.5 left-1.5 bg-ev-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5" /> Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-xs text-slate-400">
          {value.length}/{maxImages} images uploaded. Click ★ to set the primary image.
        </p>
      )}
    </div>
  );
}
