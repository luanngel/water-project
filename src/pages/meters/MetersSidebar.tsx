// src/pages/meters/MetersSidebar.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, RefreshCcw, Check } from "lucide-react";
import type React from "react";
import type { ProjectCard, TakeType } from "./MeterPage";

type Props = {
  loadingProjects: boolean;

  takeType: TakeType;
  setTakeType: (t: TakeType) => void;

  selectedProject: string;
  setSelectedProject: React.Dispatch<React.SetStateAction<string>>;

  isMockMode: boolean;
  projects: ProjectCard[];

  onRefresh: () => void;
  refreshDisabled?: boolean;

  allProjects: string[];
  onResetSelection?: () => void;
};

type TakeTypeOption = { key: TakeType; label: string };

const TAKE_TYPE_OPTIONS: TakeTypeOption[] = [
  { key: "GENERAL", label: "General" },
  { key: "LORA", label: "LoRa" },
  { key: "LORAWAN", label: "LoRaWAN" },
  { key: "GRANDES", label: "Grandes consumidores" },
];

export default function MetersSidebar({
  loadingProjects,
  takeType,
  setTakeType,
  selectedProject,
  setSelectedProject,
  isMockMode,
  projects,
  onRefresh,
  refreshDisabled,
  allProjects,
  onResetSelection,
}: Props) {
  const [typesMenuOpen, setTypesMenuOpen] = useState(false);

  // para detectar click fuera (igual a tu implementación)
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setTypesMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const takeTypeLabel = useMemo(
    () => TAKE_TYPE_OPTIONS.find((o) => o.key === takeType)?.label ?? "General",
    [takeType]
  );

  return (
    <aside className="w-[420px] shrink-0">
      <div className="bg-white rounded-xl shadow p-4 flex flex-col h-[calc(100vh-48px)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Proyectos</p>
            <p className="text-xs text-gray-400">
              Tipo: <span className="font-semibold">{takeTypeLabel}</span>
              {" • "}
              Seleccionado:{" "}
              <span className="font-semibold">
                {selectedProject || (isMockMode ? "— (modo demo)" : "—")}
              </span>
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 transition disabled:opacity-60"
            onClick={onRefresh}
            disabled={loadingProjects || !!refreshDisabled}
            title="Actualizar"
          >
            <RefreshCcw size={14} />
          </button>
        </div>

        {/* ✅ Tipos de tomas (dropdown) — mismo UI que Concentrators */}
        <div className="mt-4 relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setTypesMenuOpen((v) => !v)}
            disabled={loadingProjects}
            className="w-full inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
          >
            <span className="flex items-center gap-2">
              Tipos de tomas
              <span className="text-xs font-semibold text-gray-500">
                ({takeTypeLabel})
              </span>
            </span>

            <ChevronDown
              size={16}
              className={`${typesMenuOpen ? "rotate-180" : ""} transition`}
            />
          </button>

          {typesMenuOpen && (
            <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
              {TAKE_TYPE_OPTIONS.map((opt) => {
                const active = takeType === opt.key;

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setTakeType(opt.key);
                      setTypesMenuOpen(false);

                      // Reset selection/search desde el parent
                      onResetSelection?.();

                      if (opt.key !== "GENERAL") {
                        // mock mode -> limpia selección real
                        setSelectedProject("");
                      } else {
                        // vuelve a GENERAL -> autoselecciona real si no hay
                        setSelectedProject((prev) => prev || allProjects[0] || "");
                      }
                    }}
                    className={[
                      "w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-gray-50",
                      active ? "bg-blue-50/60" : "bg-white",
                    ].join(" ")}
                  >
                    <span
                      className={`font-semibold ${
                        active ? "text-blue-700" : "text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </span>

                    {active && <Check size={16} className="text-blue-700" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* List */}
        <div className="mt-4 overflow-y-auto flex-1 space-y-3 pr-1">
          {loadingProjects ? (
            <div className="text-sm text-gray-500">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-10">
              {isMockMode
                ? "No hay datos demo para este tipo."
                : "No se encontraron proyectos."}
            </div>
          ) : (
            projects.map((p) => {
              const active = !isMockMode && p.name === selectedProject;

              return (
                <div
                  key={p.name}
                  onClick={() => {
                    if (isMockMode) return;
                    setSelectedProject(p.name);
                    onResetSelection?.();
                  }}
                  className={[
                    "rounded-xl border p-4 transition cursor-pointer",
                    active
                      ? "border-blue-600 bg-blue-50/40"
                      : "border-gray-200 bg-white hover:bg-gray-50",
                    isMockMode ? "opacity-90" : "",
                  ].join(" ")}
                  title={
                    isMockMode
                      ? "Modo demo: estas tarjetas son mocks"
                      : "Seleccionar proyecto"
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500">{p.region}</p>
                    </div>

                    <span
                      className={[
                        "text-xs font-semibold px-2 py-1 rounded-full",
                        p.status === "ACTIVO"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700",
                      ].join(" ")}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Subproyectos</span>
                      <span className="font-medium text-gray-800">
                        {p.projects}
                      </span>
                    </div>

                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Medidores</span>
                      <span className="font-medium text-gray-800">
                        {p.meters}
                      </span>
                    </div>

                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Alertas activas</span>
                      <span className="font-medium text-gray-800">
                        {p.activeAlerts}
                      </span>
                    </div>

                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Última sync</span>
                      <span className="font-medium text-gray-800">
                        {p.lastSync}
                      </span>
                    </div>

                    <div className="col-span-2 flex justify-between gap-2">
                      <span className="text-gray-500">Responsable</span>
                      <span className="font-medium text-gray-800">
                        {p.contact}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className={[
                        "rounded-lg px-3 py-2 text-sm font-semibold shadow transition",
                        active
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-900 text-white hover:bg-gray-800",
                        isMockMode ? "opacity-50 cursor-not-allowed" : "",
                      ].join(" ")}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isMockMode) return;
                        setSelectedProject(p.name);
                        onResetSelection?.();
                      }}
                      disabled={isMockMode}
                    >
                      {isMockMode
                        ? "Demo"
                        : active
                        ? "Seleccionado"
                        : "Seleccionar"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t text-xs text-gray-500">
          Nota: region/alertas/última sync están en modo demostración hasta
          integrar backend.
        </div>
      </div>
    </aside>
  );
}
