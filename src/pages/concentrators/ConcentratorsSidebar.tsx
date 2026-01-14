// src/pages/concentrators/ConcentratorsSidebar.tsx
import { useMemo } from "react";
import { ChevronDown, Check, RefreshCcw } from "lucide-react";
import type { ProjectCard, SampleView } from "./ConcentratorsPage";

type Props = {
  loadingProjects: boolean;

  sampleView: SampleView;
  sampleViewLabel: string;

  // ✅ ahora lo controla el Page
  typesMenuOpen: boolean;
  setTypesMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;

  onChangeSampleView: (next: SampleView) => void;

  selectedProject: string;
  onSelectProject: (name: string) => void;

  // ✅ el Page manda projects={c.projectsData}
  projects: ProjectCard[];

  onRefresh: () => void;
  refreshDisabled: boolean;
};

export default function ConcentratorsSidebar({
  loadingProjects,
  sampleView,
  sampleViewLabel,
  typesMenuOpen,
  setTypesMenuOpen,
  onChangeSampleView,
  selectedProject,
  onSelectProject,
  projects,
  onRefresh,
  refreshDisabled,
}: Props) {
  const options = useMemo(
    () =>
      [
        { key: "GENERAL", label: "General" },
        { key: "LORA", label: "LoRa" },
        { key: "LORAWAN", label: "LoRaWAN" },
        { key: "GRANDES", label: "Grandes consumidores" },
      ] as Array<{ key: SampleView; label: string }>,
    []
  );

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col h-[calc(100vh-48px)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">Proyectos</p>
          <p className="text-xs text-gray-400">
            Tipo: <span className="font-semibold">{sampleViewLabel}</span>
            {" • "}
            Seleccionado:{" "}
            <span className="font-semibold">{selectedProject || "—"}</span>
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 transition disabled:opacity-60"
          onClick={onRefresh}
          disabled={loadingProjects || refreshDisabled}
          title="Actualizar"
        >
          <RefreshCcw size={14} />
        </button>
      </div>

      {/* Tipos de tomas (dropdown) */}
      <div className="mt-4 relative">
        <button
          type="button"
          onClick={() => setTypesMenuOpen((v) => !v)}
          className="w-full inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <span className="flex items-center gap-2">
            Tipos de tomas
            <span className="text-xs font-semibold text-gray-500">
              ({sampleViewLabel})
            </span>
          </span>
          <ChevronDown
            size={16}
            className={`${typesMenuOpen ? "rotate-180" : ""} transition`}
          />
        </button>

        {typesMenuOpen && (
          <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
            {options.map((opt) => {
              const active = sampleView === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onChangeSampleView(opt.key)}
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
        {loadingProjects && sampleView === "GENERAL" ? (
          <div className="text-sm text-gray-500">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-sm text-gray-500">
            No projects available. Please contact your administrator.
          </div>
        ) : (
          projects.map((p) => {
            const active = p.name === selectedProject;

            return (
              <div
                key={p.name}
                onClick={() => onSelectProject(p.name)}
                className={[
                  "rounded-xl border p-4 transition cursor-pointer",
                  active
                    ? "border-blue-600 bg-blue-50/40"
                    : "border-gray-200 bg-white hover:bg-gray-50",
                ].join(" ")}
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
                    <span className="text-gray-500">Concentradores</span>
                    <span className="font-medium text-gray-800">
                      {p.concentrators}
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
                    <span className="font-medium text-gray-800">{p.lastSync}</span>
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
                    ].join(" ")}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(p.name);
                    }}
                  >
                    {active ? "Seleccionado" : "Seleccionar"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-3 border-t text-xs text-gray-500">
        Nota: region/alertas/última sync están en modo demostración hasta integrar
        backend.
      </div>
    </div>
  );
}
