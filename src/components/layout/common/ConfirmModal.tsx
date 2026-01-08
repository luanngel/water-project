import React, { useEffect, useRef } from "react";

export default function ConfirmModal({
  open,
  title = "Confirmar",
  message = "¿Estás seguro?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    // enfoque inicial para accesibilidad
    const t = setTimeout(() => panelRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Panel */}
      <div className="relative mx-auto mt-28 w-[min(520px,calc(100vw-32px))]">
        <div
          ref={panelRef}
          tabIndex={-1}
          className="rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden outline-none"
        >
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="text-base font-semibold text-slate-900">{title}</div>
          </div>

          <div className="px-6 py-5">
            <p className="text-sm text-slate-700">{message}</p>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2 text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition disabled:opacity-60"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={[
                "rounded-xl px-4 py-2 text-sm font-semibold text-white transition",
                danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700",
                "focus:outline-none focus:ring-2",
                danger ? "focus:ring-red-500" : "focus:ring-blue-500",
                "focus:ring-offset-2",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              {loading ? "Procesando..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
