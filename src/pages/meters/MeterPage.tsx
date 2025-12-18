import { useState } from "react";
import { Plus, Trash2, Pencil, RefreshCcw } from "lucide-react";
import MaterialTable from "@material-table/core";

/* ================= TYPES ================= */
export interface Meter {
  id: string; // recordId
  serialNumber: string;
  status: "ACTIVE" | "INACTIVE";
  project: string;
  createdAt: string;
}

interface User {
  name: string;
  role: "SUPER_ADMIN" | "USER";
  project?: string; // asignado si no es superadmin
}

/* ================= COMPONENT ================= */
export default function MeterManagement() {
  // Simulación de usuario actual
  const currentUser: User = {
    name: "Admin GRH",
    role: "SUPER_ADMIN", // cambiar a USER para probar otro caso
    project: "CESPT",
  };

  // Lista de proyectos disponibles
  const allProjects = ["GRH (PADRE)", "CESPT", "Proyecto A", "Proyecto B"];

  // Proyectos visibles según el usuario
  const visibleProjects =
    currentUser.role === "SUPER_ADMIN"
      ? allProjects
      : currentUser.project
      ? [currentUser.project]
      : [];

  const [selectedProject, setSelectedProject] = useState(
    visibleProjects[0] || ""
  );

  // Datos locales iniciales (simulan la API)
  const initialMeters: Meter[] = [
    {
      id: "1",
      serialNumber: "SN001",
      status: "ACTIVE",
      project: "GRH (PADRE)",
      createdAt: "2025-12-17",
    },
    {
      id: "2",
      serialNumber: "SN002",
      status: "INACTIVE",
      project: "CESPT",
      createdAt: "2025-12-16",
    },
    {
      id: "3",
      serialNumber: "SN003",
      status: "ACTIVE",
      project: "Proyecto A",
      createdAt: "2025-12-15",
    },
  ];

  const [meters, setMeters] = useState<Meter[]>(initialMeters);
  const [activeMeter, setActiveMeter] = useState<Meter | null>(null);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyMeter: Omit<Meter, "id"> = {
    serialNumber: "",
    status: "ACTIVE",
    project: selectedProject,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  const [form, setForm] = useState<Omit<Meter, "id">>(emptyMeter);

  /* ================= CRUD LOCAL ================= */
  const handleSave = () => {
    if (editingId) {
      setMeters((prev) =>
        prev.map((m) =>
          m.id === editingId ? { ...m, ...form } : m
        )
      );
    } else {
      const newMeter: Meter = {
        id: (Math.random() * 1000000).toFixed(0),
        ...form,
      };
      setMeters((prev) => [...prev, newMeter]);
    }

    setShowModal(false);
    setEditingId(null);
    setForm({ ...emptyMeter, project: selectedProject });
    setActiveMeter(null);
  };

  const handleDelete = () => {
    if (!activeMeter) return;
    setMeters((prev) => prev.filter((m) => m.id !== activeMeter.id));
    setActiveMeter(null);
  };

  const handleRefresh = () => {
    // Simula recargar los datos originales
    setMeters(initialMeters);
    setActiveMeter(null);
  };

  /* ================= FILTER ================= */
  const filtered = meters.filter(
    (m) =>
      (m.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
        m.project.toLowerCase().includes(search.toLowerCase())) &&
      m.project === selectedProject
  );

  /* ================= UI ================= */
  return (
    <div className="flex gap-6 p-6 w-full bg-gray-100">
      {/* LEFT INFO SIDEBAR */}
      <div className="w-72 bg-white rounded-xl shadow p-4">
        <h3 className="text-xs font-semibold text-gray-500 mb-3">
          Project Information
        </h3>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          {visibleProjects.map((proj) => (
            <option key={proj} value={proj}>
              {proj}
            </option>
          ))}
        </select>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col gap-6">
        {/* HEADER */}
        <div
          className="rounded-xl shadow p-6 text-white flex justify-between items-center"
          style={{
            background:
              "linear-gradient(135deg, #4c5f9e, #2a355d, #566bb8)",
          }}
        >
          <div>
            <h1 className="text-2xl font-bold">Meter Management</h1>
            <p className="text-sm text-blue-100">Medidores registrados</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setForm({ ...emptyMeter, project: selectedProject });
                setEditingId(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#4c5f9e] rounded-lg"
            >
              <Plus size={16} /> Add
            </button>

            <button
              onClick={() => {
                if (!activeMeter) return;
                setEditingId(activeMeter.id);
                setForm({ ...activeMeter });
                setShowModal(true);
              }}
              disabled={!activeMeter}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"
            >
              <Pencil size={16} /> Edit
            </button>

            <button
              onClick={handleDelete}
              disabled={!activeMeter}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"
            >
              <Trash2 size={16} /> Delete
            </button>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg"
            >
              <RefreshCcw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <input
          className="bg-white rounded-lg shadow px-4 py-2 text-sm"
          placeholder="Search meter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* TABLE */}
        <MaterialTable
          title="Meters"
          columns={[
            { title: "Serial", field: "serialNumber" },
            {
              title: "Status",
              field: "status",
              render: (rowData) => (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    rowData.status === "ACTIVE"
                      ? "text-blue-600 border-blue-600"
                      : "text-red-600 border-red-600"
                  }`}
                >
                  {rowData.status}
                </span>
              ),
            },
            { title: "Project", field: "project" },
            { title: "Created", field: "createdAt", type: "date" },
          ]}
          data={filtered}
          onRowClick={(_, rowData) => setActiveMeter(rowData as Meter)}
          options={{
            actionsColumnIndex: -1,
            search: false,
            paging: true,
            sorting: true,
            rowStyle: (rowData) => ({
              backgroundColor:
                activeMeter?.id === (rowData as Meter).id
                  ? "#EEF2FF"
                  : "#FFFFFF",
            }),
          }}
        />
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-96 space-y-3">
            <h2 className="text-lg font-semibold">
              {editingId ? "Edit Meter" : "Add Meter"}
            </h2>

            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Serial Number"
              value={form.serialNumber}
              onChange={(e) =>
                setForm({ ...form, serialNumber: e.target.value })
              }
            />

            <button
              onClick={() =>
                setForm({
                  ...form,
                  status: form.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                })
              }
              className="w-full border rounded px-3 py-2"
            >
              Status: {form.status}
            </button>

            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Project"
              value={form.project}
              onChange={(e) =>
                setForm({ ...form, project: e.target.value })
              }
            />

            <input
              type="date"
              className="w-full border px-3 py-2 rounded"
              value={form.createdAt}
              onChange={(e) =>
                setForm({ ...form, createdAt: e.target.value })
              }
            />

            <div className="flex justify-end gap-2 pt-3">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button
                onClick={handleSave}
                className="bg-[#4c5f9e] text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
