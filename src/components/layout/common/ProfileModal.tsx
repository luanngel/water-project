import React, { useEffect, useMemo, useRef, useState } from "react";

type ProfileForm = {
  name: string;
  email: string;
  organismName?: string; // "Empresa" / "Organismo" (CESPT, etc.)
};

export default function ProfileModal({
  open,
  loading = false,
  initial,
  avatarUrl = null,
  onClose,
  onSave,
  onUploadAvatar,
}: {
  open: boolean;
  loading?: boolean;
  initial: ProfileForm;
  avatarUrl?: string | null;
  onClose: () => void;
  onSave: (next: ProfileForm) => void | Promise<void>;
  onUploadAvatar?: (file: File) => void | Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [organismName, setOrganismName] = useState(initial?.organismName ?? "");

  // Avatar preview local (si el usuario selecciona imagen)
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const lastPreviewUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mantener el form sincronizado cuando se abre o cambia initial
  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setEmail(initial?.email ?? "");
    setOrganismName(initial?.organismName ?? "");
    setLocalAvatar(null);
  }, [open, initial?.name, initial?.email, initial?.organismName]);

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Limpieza de object URLs
  useEffect(() => {
    return () => {
      if (lastPreviewUrlRef.current) {
        URL.revokeObjectURL(lastPreviewUrlRef.current);
      }
    };
  }, []);

  const initials = useMemo(() => {
    const parts = (name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const a = parts[0]?.[0] ?? "U";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase();
  }, [name]);

  const computedAvatarSrc = useMemo(() => {
    const src = localAvatar ?? avatarUrl;
    if (!src) return null;
    if (src.startsWith("blob:")) return src;
    // cache-bust por si el backend mantiene la misma URL
    const sep = src.includes("?") ? "&" : "?";
    return `${src}${sep}t=${Date.now()}`;
  }, [localAvatar, avatarUrl]);

  const triggerFilePicker = () => {
    if (!onUploadAvatar) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const maxMb = 5;
    const sizeOk = file.size <= maxMb * 1024 * 1024;

    if (!isImage) {
      alert("Selecciona un archivo de imagen.");
      e.target.value = "";
      return;
    }
    if (!sizeOk) {
      alert(`La imagen debe pesar máximo ${maxMb}MB.`);
      e.target.value = "";
      return;
    }

    // Preview inmediato
    const previewUrl = URL.createObjectURL(file);
    if (lastPreviewUrlRef.current) URL.revokeObjectURL(lastPreviewUrlRef.current);
    lastPreviewUrlRef.current = previewUrl;
    setLocalAvatar(previewUrl);

    try {
      await onUploadAvatar?.(file);
    } catch (err) {
      console.error(err);
      alert("No se pudo subir la imagen. Intenta de nuevo.");
    } finally {
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }
    if (!email.trim()) {
      alert("El correo es obligatorio.");
      return;
    }

    await onSave({
      name: name.trim(),
      email: email.trim(),
      organismName: organismName.trim() || undefined,
    });
  };

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

      {/* Modal */}
      <div className="relative mx-auto mt-16 w-[min(860px,calc(100vw-32px))]">
        <div className="rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="text-base font-semibold text-slate-900">
              Editar perfil
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
              {/* LEFT: Avatar */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                    {computedAvatarSrc ? (
                      <img
                        src={computedAvatarSrc}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700 font-semibold text-2xl">
                        {initials}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-semibold text-slate-900 truncate max-w-[220px]">
                      {name || "Usuario"}
                    </div>
                    <div className="text-xs text-slate-500 truncate max-w-[220px]">
                      {email || "correo@ejemplo.gob.mx"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={triggerFilePicker}
                    disabled={!onUploadAvatar}
                    className={[
                      "mt-4 w-full rounded-xl px-4 py-2 text-sm font-medium",
                      "border border-slate-200 bg-white text-slate-700",
                      "hover:bg-slate-100 transition",
                      !onUploadAvatar ? "opacity-50 cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    Cambiar imagen
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* RIGHT: Form */}
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  correo electrónico
                </div>

                <div className="mt-4 space-y-4">
                  <Field label="Nombre:">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-200"
                      placeholder="Nombre del usuario"
                    />
                  </Field>

                  <Field label="Correo:">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-200"
                      placeholder="correo@organismo.gob.mx"
                    />
                  </Field>

                  <Field label="Empresa:">
                    <input
                      value={organismName}
                      onChange={(e) => setOrganismName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-200"
                      placeholder="Organismo operador"
                    />
                  </Field>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition"
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={[
                "rounded-xl px-4 py-2 text-sm font-semibold",
                "bg-blue-600 text-white hover:bg-blue-700",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                loading ? "opacity-60 cursor-not-allowed" : "",
              ].join(" ")}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[90px_1fr] items-center gap-3">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      {children}
    </div>
  );
}
