import { Cpu, Settings, BarChart3, Bell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Home() {
  const companies = [
    { name: "Empresa A", tomas: 12, alerts: 2, consumption: 320 },
    { name: "Empresa B", tomas: 8, alerts: 0, consumption: 210 },
    { name: "Empresa C", tomas: 15, alerts: 1, consumption: 450 },
  ];

  const alerts = [
    { company: "Empresa A", type: "Fuga", time: "Hace 2 horas" },
    { company: "Empresa C", type: "Consumo alto", time: "Hace 5 horas" },
    { company: "Empresa B", type: "Inactividad", time: "Hace 8 horas" },
  ];

  return (
    <div className="flex flex-col p-6 gap-8 w-full">

      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Sistema de Tomas de Agua</h1>
        <p className="text-gray-600 mt-2">
          Monitorea, administra y controla tus operaciones en un solo lugar.
        </p>
      </div>

      {/* Cards de Secciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 transition">
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

      {/* Resumen de tomas por empresa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((c) => (
          <div
            key={c.name}
            className="bg-white rounded-xl shadow p-4 flex flex-col gap-1"
          >
            <span className="text-gray-500 text-sm">{c.name}</span>
            <span className="text-2xl font-bold text-gray-800">{c.tomas} Tomas</span>
            <span className={`text-sm font-medium ${c.alerts > 0 ? "text-red-500" : "text-green-500"}`}>
              {c.alerts} Alertas
            </span>
          </div>
        ))}
      </div>

      {/* Gráfica de consumo */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Consumo de Agua por Empresa</h2>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={companies} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="consumption" fill="#4c5f9e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Últimas alertas */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Últimas Alertas</h2>
        <ul className="divide-y divide-gray-200">
          {alerts.map((a, i) => (
            <li key={i} className="py-2 flex justify-between">
              <span>{a.company} - {a.type}</span>
              <span className="text-red-500 font-medium">{a.time}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
