import { Cpu, Settings, BarChart3, Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { fetchMeters, type Meter } from "../api/meters";
import type { Page } from "../App";
import grhWatermark from "../assets/images/grhWatermark.png";

/* ================= TYPES ================= */

type OrganismStatus = "ACTIVO" | "INACTIVO";

type Organism = {
  name: string;
  region: string;
  projects: number;
  meters: number;
  activeAlerts: number;
  lastSync: string;
  contact: string;
  status: OrganismStatus;
};

type AlertItem = { company: string; type: string; time: string };

type HistoryItem = {
  user: string;
  action: string;
  target: string;
  time: string;
};

/* ================= COMPONENT ================= */

export default function Home({
  setPage,
  navigateToMetersWithProject,
}: {
  setPage: (page: Page) => void;
  navigateToMetersWithProject: (projectName: string) => void;
}) {
  /* ================= ORGANISMS (MOCK) ================= */

  const organismsData: Organism[] = [
    {
      name: "CESPT TIJUANA",
      region: "Tijuana, BC",
      projects: 6,
      meters: 128,
      activeAlerts: 0,
      lastSync: "Hace 12 min",
      contact: "Operaciones CESPT",
      status: "ACTIVO",
    },
    {
      name: "CESPT TECATE",
      region: "Tecate, BC",
      projects: 3,
      meters: 54,
      activeAlerts: 1,
      lastSync: "Hace 40 min",
      contact: "Mantenimiento",
      status: "ACTIVO",
    },
    {
      name: "CESPT MEXICALI",
      region: "Mexicali, BC",
      projects: 4,
      meters: 92,
      activeAlerts: 0,
      lastSync: "Hace 1 h",
      contact: "Supervisión",
      status: "ACTIVO",
    },
  ];

  const [selectedOrganism, setSelectedOrganism] = useState<string>(
    organismsData[0]?.name ?? "CESPT TIJUANA"
  );
  const [showOrganisms, setShowOrganisms] = useState(false);
  const [organismQuery, setOrganismQuery] = useState("");

  /* ================= METERS ================= */

  const [meters, setMeters] = useState<Meter[]>([]);

  const loadMeters = async () => {
    try {
      const data = await fetchMeters();
      setMeters(data);
    } catch (err) {
      console.error("Error loading meters:", err);
      setMeters([]);
    }
  };

  useEffect(() => {
    loadMeters();
  }, []);

  // TODO: Reemplazar cuando el backend mande el organismo real (ej: meter.organismName)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getOrganismFromMeter = (_m: Meter): string => {
    return "CESPT TIJUANA";
  };

  const filteredMeters = useMemo(
    () => meters.filter((m) => getOrganismFromMeter(m) === selectedOrganism),
    [meters, selectedOrganism]
  );

  const filteredProjects = useMemo(
    () => [...new Set(filteredMeters.map((m) => m.areaName))],
    [filteredMeters]
  );

  const chartData = useMemo(
    () =>
      filteredProjects.map((projectName) => ({
        name: projectName,
        meterCount: filteredMeters.filter((m) => m.areaName === projectName)
          .length,
      })),
    [filteredProjects, filteredMeters]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBarClick = (data: any) => {
    if (data?.activeLabel) {
      navigateToMetersWithProject(data.activeLabel);
    }
  };

  /* ================= ORGANISM FILTER (DRAWER) ================= */

  const filteredOrganisms = useMemo(() => {
    const q = organismQuery.trim().toLowerCase();
    if (!q) return organismsData;
    return organismsData.filter((o) => o.name.toLowerCase().includes(q));
  }, [organismQuery]);

  /* ================= MOCK ALERTS / HISTORY ================= */

  const alerts: AlertItem[] = [
    { company: "Empresa A", type: "Fuga", time: "Hace 2 horas" },
    { company: "Empresa C", type: "Consumo alto", time: "Hace 5 horas" },
    { company: "Empresa B", type: "Inactividad", time: "Hace 8 horas" },
  ];

  const history: HistoryItem[] = [
    {
      user: "GRH",
      action: "Creó un nuevo medidor",
      target: "SN001",
      time: "Hace 5 minutos",
    },
    {
      user: "CESPT",
      action: "Actualizó concentrador",
      target: "Planta 1",
      time: "Hace 20 minutos",
    },
    {
      user: "GRH",
      action: "Eliminó un usuario",
      target: "Juan Pérez",
      time: "Hace 1 hora",
    },
    {
      user: "CESPT",
      action: "Creó un payload",
      target: "Payload 12",
      time: "Hace 2 horas",
    },
    {
      user: "GRH",
      action: "Actualizó medidor",
      target: "SN002",
      time: "Hace 3 horas",
    },
  ];

  /* ================= KPIs (Optional) ================= */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalMeters = filteredMeters.length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalProjects = filteredProjects.length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalActiveAlerts = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const avgMetersPerProject =
    totalProjects > 0 ? totalMeters / totalProjects : 0;

  return (
    <div className="flex flex-col p-6 gap-8 w-full">
      {/* Título + Selector */}
      <div className="flex flex-col gap-3">
        {/* ✅ Título + logo a la derecha */}
<div className="relative flex items-start justify-between gap-6">
  <div className="relative z-10">
    <h1 className="text-3xl font-bold text-gray-800">
      Sistema de Tomas de Agua
    </h1>
    <p className="text-gray-600 mt-2">
      Monitorea, administra y controla tus operaciones en un solo lugar.
    </p>
  </div>

  {/* ✅ Logo con z-index bajo para NO tapar menús */}
  <img
    src={grhWatermark}
    alt="Gestión de Recursos Hídricos"
    className="relative z-0 h-10 w-auto opacity-80 select-none pointer-events-none shrink-0"
    draggable={false}
  />
</div>

        {/* Cards de Secciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 transition cursor-pointer"
            onClick={() => setPage("meters")}
          >
            <Cpu size={40} className="text-blue-600" />
            <span className="font-semibold text-gray-700">Tomas</span>
          </div>

          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center gap-2 hover:bg-red-50 transition">
            <Bell size={40} className="text-red-600" />
            <span className="font-semibold text-gray-700">Alertas</span>
          </div>

          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center gap-2 hover:bg-yellow-50 transition">
            <Settings size={40} className="text-yellow-600" />
            <span className="font-semibold text-gray-700">Mantenimiento</span>
          </div>

          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center gap-2 hover:bg-green-50 transition">
            <BarChart3 size={40} className="text-green-600" />
            <span className="font-semibold text-gray-700">Reportes</span>
          </div>
        </div>

        {/* Organismos Operadores */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">Organismos Operadores</p>
              <p className="text-xs text-gray-400">
                Seleccionado:{" "}
                <span className="font-semibold">{selectedOrganism}</span>
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
              onClick={() => setShowOrganisms(true)}
            >
              Organismos Operadores
            </button>
          </div>

          {showOrganisms && (
            <div className="fixed inset-0 z-50">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => {
                  setShowOrganisms(false);
                  setOrganismQuery("");
                }}
              />

              {/* Panel */}
              <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-5 border-b flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Organismos Operadores
                    </h3>
                    <p className="text-sm text-gray-500">
                      Selecciona un organismo para filtrar la información del
                      dashboard.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-sm border border-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      setShowOrganisms(false);
                      setOrganismQuery("");
                    }}
                  >
                    Cerrar
                  </button>
                </div>

                {/* Search */}
                <div className="p-5 border-b">
                  <input
                    value={organismQuery}
                    onChange={(e) => setOrganismQuery(e.target.value)}
                    placeholder="Buscar organismo…"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* List */}
                <div className="p-5 overflow-y-auto flex-1 space-y-3">
                  {filteredOrganisms.map((o) => {
                    const active = o.name === selectedOrganism;

                    return (
                      <div
                        key={o.name}
                        className={[
                          "rounded-xl border p-4 transition",
                          active
                            ? "border-blue-600 bg-blue-50/40"
                            : "border-gray-200 bg-white hover:bg-gray-50",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {o.name}
                            </p>
                            <p className="text-xs text-gray-500">{o.region}</p>
                          </div>

                          <span
                            className={[
                              "text-xs font-semibold px-2 py-1 rounded-full",
                              o.status === "ACTIVO"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-700",
                            ].join(" ")}
                          >
                            {o.status}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between gap-2">
                            <span className="text-gray-500">Proyectos</span>
                            <span className="font-medium text-gray-800">
                              {o.projects}
                            </span>
                          </div>

                          <div className="flex justify-between gap-2">
                            <span className="text-gray-500">Medidores</span>
                            <span className="font-medium text-gray-800">
                              {o.meters}
                            </span>
                          </div>

                          <div className="flex justify-between gap-2">
                            <span className="text-gray-500">Alertas activas</span>
                            <span className="font-medium text-gray-800">
                              {o.activeAlerts}
                            </span>
                          </div>

                          <div className="flex justify-between gap-2">
                            <span className="text-gray-500">Última sync</span>
                            <span className="font-medium text-gray-800">
                              {o.lastSync}
                            </span>
                          </div>

                          <div className="col-span-2 flex justify-between gap-2">
                            <span className="text-gray-500">Responsable</span>
                            <span className="font-medium text-gray-800">
                              {o.contact}
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
                            onClick={() => {
                              setSelectedOrganism(o.name);
                              setShowOrganisms(false);
                              setOrganismQuery("");
                            }}
                          >
                            {active ? "Seleccionado" : "Seleccionar"}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {filteredOrganisms.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-10">
                      No se encontraron organismos.
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t text-xs text-gray-500">
                  Nota: Las propiedades están en modo demostración hasta integrar
                  backend.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gráfica */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">
            Número de Medidores por Proyecto
          </h2>
          <span className="text-xs text-gray-400">
            Click en barra para ver tomas
          </span>
        </div>

        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              onClick={handleBarClick}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="meterCount" fill="#4c5f9e" cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Historial Reciente</h2>
        <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
          {history.map((h, i) => (
            <li key={i} className="py-2 flex items-start gap-3">
              <span className="text-gray-400 mt-1">•</span>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{h.user}</span> {h.action}{" "}
                  <span className="font-medium">{h.target}</span>
                </p>
                <p className="text-xs text-gray-400">{h.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Últimas alertas */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Últimas Alertas</h2>
        <ul className="divide-y divide-gray-200">
          {alerts.map((a, i) => (
            <li key={i} className="py-2 flex justify-between">
              <span>
                {a.company} - {a.type}
              </span>
              <span className="text-red-500 font-medium">{a.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
