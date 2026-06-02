"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  const confirmBtnClass =
    variant === "danger"
      ? "bg-red-500 hover:bg-red-600 text-white"
      : variant === "warning"
      ? "bg-amber-500 hover:bg-amber-600 text-white"
      : "btn-ev";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        {/* Close */}
        <button
          id="confirm-dialog-close"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              variant === "danger"
                ? "bg-red-50"
                : variant === "warning"
                ? "bg-amber-50"
                : "bg-blue-100"
            }`}
          >
            <AlertTriangle
              className={`w-6 h-6 ${
                variant === "danger"
                  ? "text-red-500"
                  : variant === "warning"
                  ? "text-amber-500"
                  : "text-blue-600"
              }`}
            />
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            {description}
          </p>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              id="confirm-dialog-cancel"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              id="confirm-dialog-confirm"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-60 ${confirmBtnClass}`}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

