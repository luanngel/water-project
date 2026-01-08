import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

type Theme = "system" | "light" | "dark";

export interface AppSettings {
  theme: Theme;
  compactMode: boolean;
}

const STORAGE_KEY = "water_project_settings_v1";

export const defaultSettings: AppSettings = {
  theme: "system",
  compactMode: false,
};

export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      theme: parsed.theme ?? defaultSettings.theme,
      compactMode: parsed.compactMode ?? defaultSettings.compactMode,
    };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (s: AppSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.remove("dark");

  if (theme === "dark") root.classList.add("dark");

  if (theme === "system") {
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    if (prefersDark) root.classList.add("dark");
  }
};

export default function SettingsModal({
  open,
  onClose,
  settings,
  setSettings,
}: {
  open: boolean;
  onClose: () => void;
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
}) {
  const [local, setLocal] = useState<AppSettings>(settings);

  useEffect(() => {
    if (open) setLocal(settings);
  }, [open, settings]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const onSave = () => {
    setSettings(local);
    saveSettings(local);
    applyTheme(local.theme);
    onClose();
  };

  const onReset = () => setLocal(defaultSettings);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Configuración"
    >
      {/* Overlay */}
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Cerrar"
      />

      {/* Panel */}
      <div className="relative w-[92vw] max-w-lg rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-800">Configuración</h2>
          <button
            type="button"
            aria-label="Cerrar"
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Tema */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-800">Tema</p>
            <div className="flex flex-wrap gap-2">
              {([
                { key: "system", label: "Sistema" },
                { key: "light", label: "Claro" },
                { key: "dark", label: "Oscuro" },
              ] as const).map((t) => {
                const active = local.theme === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setLocal((p) => ({ ...p, theme: t.key }))}
                    className={[
                      "px-3 py-1 rounded-full text-sm border transition",
                      active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compact mode */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">Modo compacto</p>
              <p className="text-xs text-gray-500">
                Reduce paddings/espaciado en tablas y tarjetas.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setLocal((p) => ({ ...p, compactMode: !p.compactMode }))
              }
              className={[
                "w-12 h-7 rounded-full transition relative",
                local.compactMode ? "bg-blue-600" : "bg-gray-300",
              ].join(" ")}
              aria-label="Alternar modo compacto"
            >
              <span
                className={[
                  "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition",
                  local.compactMode ? "left-5" : "left-0.5",
                ].join(" ")}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t">
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-semibold text-gray-600 hover:text-gray-800 transition"
          >
            Restablecer
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSave}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
